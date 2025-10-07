import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  console.log('Connected to DB');
}

function seatParts(seat) {
  const m = seat.match(/^([A-Z]+)(\d+)$/i);
  return m ? { row: m[1].toUpperCase(), col: parseInt(m[2], 10) } : null;
}

function seatString(row, col) { return `${row}${col}`; }

function generateCanonical(layout) {
  const seats = [];
  layout.rows.forEach(r => {
    for (let c = 1; c <= r.seats; c++) seats.push(seatString(r.rowLabel, c));
  });
  return seats;
}

// find best canonical seat for an original seat (prefer same row, nearest column)
function findBestSeatFor(original, canonicalSeatsSet, taken) {
  const p = seatParts(original);
  if (!p) return null;
  const rowCandidates = Array.from(canonicalSeatsSet).filter(s => s.startsWith(p.row));
  if (rowCandidates.length) {
    // find nearest column
    rowCandidates.sort((a,b)=>Math.abs(parseInt(a.slice(p.row.length))-p.col)-Math.abs(parseInt(b.slice(p.row.length))-p.col));
    const choice = rowCandidates.find(s=>!taken.has(s));
    if (choice) return choice;
  }
  // fallback: any canonical seat
  const any = Array.from(canonicalSeatsSet).find(s=>!taken.has(s));
  return any || null;
}

async function run() {
  await connect();
  const events = await Event.find({});
  for (const ev of events) {
    // find layout
    const layoutKey = Object.keys(auditoriumLayouts).find(k => k.toLowerCase() === ev.auditorium.trim().toLowerCase());
    const layout = auditoriumLayouts[layoutKey];
    if (!layout) {
      console.log(`No canonical layout for event ${ev._id} auditorium=${ev.auditorium}`);
      continue;
    }
    const canonicalSeats = generateCanonical(layout);
    const canonicalSet = new Set(canonicalSeats);

    // backup event and bookings
    const EventsBackup = mongoose.connection.collection('events_normalize_backup');
    const BookingsBackup = mongoose.connection.collection('bookings_normalize_backup');
    await EventsBackup.insertOne(ev.toObject());

    const bookings = await Booking.find({ event: ev._id }).lean();
    if (bookings.length) await BookingsBackup.insertMany(bookings);

    // Build map of originally booked seats -> booking ids
    const originalBooked = bookings.flatMap(b => b.seatNumbers.map(sn => ({ seat: sn, bookingId: b._id.toString() })));

    const taken = new Set(); // canonical seats already assigned
    const remap = {}; // oldSeat -> newSeat

    for (const ob of originalBooked) {
      if (canonicalSet.has(ob.seat) && !taken.has(ob.seat)) {
        remap[ob.seat] = ob.seat;
        taken.add(ob.seat);
      } else {
        const best = findBestSeatFor(ob.seat, canonicalSet, taken);
        if (best) {
          remap[ob.seat] = best;
          taken.add(best);
        } else {
          // no free canonical seat; we'll preserve the original as extra and skip remap
          remap[ob.seat] = null;
        }
      }
    }

    // Apply remap to Booking docs
    for (const b of bookings) {
      let changed = false;
      b.seatNumbers = b.seatNumbers.map(sn => {
        if (remap[sn] === null || remap[sn] === undefined) return sn; // leave as-is (extra preserved)
        if (remap[sn] === sn) return sn; // unchanged
        changed = true;
        return remap[sn];
      });
      if (changed) {
        await Booking.updateOne({ _id: b._id }, { $set: { seatNumbers: b.seatNumbers } });
      }
    }

    // Build new event.seats: canonical seats with isBooked if taken, and append preserved extras
    const newSeats = canonicalSeats.map(s => ({ seatNumber: s, isBooked: taken.has(s) }));
    // preserve extras that could not be remapped (remap value null)
    const preservedExtras = Object.entries(remap).filter(([,v])=>v===null).map(([old])=>({ seatNumber: old, isBooked: true }));
    const finalSeats = [...newSeats, ...preservedExtras];

    ev.seats = finalSeats;
    ev.auditorium = layoutKey;
    await ev.save();
    console.log(`Normalized event ${ev._id}. remapped ${Object.keys(remap).length} bookings, preserved ${preservedExtras.length} extras.`);
  }

  console.log('Normalization complete');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
