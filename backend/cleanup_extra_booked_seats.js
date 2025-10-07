import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj';
  await mongoose.connect(uri);
  console.log('Connected to DB');
}

function seatToParts(seat) {
  const match = seat.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  return { row: match[1].toUpperCase(), col: parseInt(match[2], 10) };
}

function partsToSeat(row, col) {
  return `${row}${col}`;
}

// find nearest free canonical seat given layout rows and existing seats map
function findNearestFreeSeat(layoutRows, seatsMap) {
  // layoutRows: array of { row, cols }
  // seatsMap: map seatNumber -> isBooked boolean
  // Strategy: iterate rows in order, then columns ascending, find first not booked
  for (const r of layoutRows) {
    for (let c = 1; c <= r.cols; c++) {
      const s = partsToSeat(r.row, c);
      if (!seatsMap[s] || seatsMap[s] === false) return s;
    }
  }
  return null;
}

async function run() {
  await connect();

  const events = await Event.find({}).lean();

  for (const ev of events) {
    const layout = auditoriumLayouts[ev.auditorium];
    if (!layout) continue;

    const canonicalSeats = [];
    // layout.rows uses { rowLabel, seats }
    layout.rows.forEach(r => {
      for (let c = 1; c <= r.seats; c++) canonicalSeats.push(`${r.rowLabel}${c}`);
    });

    const actualSeatNumbers = (ev.seats || []).map(s => s.seatNumber);
    const extra = actualSeatNumbers.filter(s => !canonicalSeats.includes(s));
    const extraBooked = (ev.seats || []).filter(s => extra.includes(s.seatNumber) && s.isBooked);
    if (extraBooked.length === 0) continue;

    console.log(`Event ${ev._id} has extra booked seats:`, extraBooked.map(s=>s.seatNumber));

    // Backup event and related bookings
    const EventsBackup = mongoose.connection.collection('events_cleanup_backup');
    const BookingsBackup = mongoose.connection.collection('bookings_cleanup_backup');
    await EventsBackup.insertOne(ev);
    const relatedBookings = await Booking.find({ event: ev._id, seatNumbers: { $in: extraBooked.map(s=>s.seatNumber) } }).lean();
    if (relatedBookings.length) await BookingsBackup.insertMany(relatedBookings);

    // Build seatsMap from canonical seats and current bookings
    const seatsMap = {};
    // initialize from canonical seats as false
    canonicalSeats.forEach(s => seatsMap[s] = false);
    // mark booked canonical seats from event.seats
    (ev.seats || []).forEach(s => {
      if (canonicalSeats.includes(s.seatNumber)) seatsMap[s.seatNumber] = !!s.isBooked;
    });

    // For each extraBooked, try to remap
    for (const ex of extraBooked) {
      // find nearest free canonical seat
      const newSeat = findNearestFreeSeat(layout.rows, seatsMap);
      if (!newSeat) {
        console.log(`  No free canonical seat to remap ${ex.seatNumber} for event ${ev._id}; leaving as-is`);
        continue;
      }

      console.log(`  Remapping ${ex.seatNumber} -> ${newSeat}`);

      // Update Booking docs: replace seat number in seatNumbers array
      const bookings = await Booking.find({ event: ev._id, seatNumbers: ex.seatNumber });
      for (const b of bookings) {
        b.seatNumbers = b.seatNumbers.map(sn => (sn === ex.seatNumber ? newSeat : sn));
        await b.save();
      }

      // Mark newSeat as booked in seatsMap
      seatsMap[newSeat] = true;

      // Update Event: remove the extra seat and set newSeat as booked (or mark it in event.seats)
      // We'll perform a full event.seats rewrite at the end
    }

    // Rebuild event.seats from canonical seats and seatsMap
    const newSeats = canonicalSeats.map(sn => ({ seatNumber: sn, isBooked: !!seatsMap[sn] }));

    // Also, if some extra seats remain (were left because no remap), append them to preserve
    const remainingExtra = (ev.seats || []).filter(s => extra.includes(s.seatNumber) && s.isBooked && !Object.values(seatsMap).some(v=>v && v === s.seatNumber));
    // Note: I made a mistake above; remainingExtra computation needs seatNumber compare. Simpler: append extras that were not remapped
    const remappedTargets = Object.keys(seatsMap).filter(k=>seatsMap[k]);

    // Append any original extra booked seats that couldn't be remapped (or we left intentionally)
    const extrasToAppend = (ev.seats || []).filter(s => extra.includes(s.seatNumber) && s.isBooked && !remappedTargets.includes(s.seatNumber)).map(s=>({ seatNumber: s.seatNumber, isBooked: true }));

    const finalSeats = [...newSeats, ...extrasToAppend];

    // Update event in DB
    await Event.updateOne({ _id: ev._id }, { $set: { seats: finalSeats } });

    console.log(`  Event ${ev._id} updated. Remapped extras: ${extraBooked.map(s=>s.seatNumber).join(', ')}`);
  }

  console.log('Cleanup complete');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
