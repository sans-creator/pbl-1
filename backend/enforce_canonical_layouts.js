import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect() { await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj'); console.log('Connected'); }

function generateCanonical(layout) {
  const seats = [];
  layout.rows.forEach(r => { for (let c = 1; c <= r.seats; c++) seats.push(`${r.rowLabel}${c}`); });
  return seats;
}

function seatParts(seat){ const m=seat.match(/^([A-Z]+)(\d+)$/i); return m?{row:m[1].toUpperCase(),col:parseInt(m[2],10)}:null }

// helper to sort candidates by distance from preferred column
function sortByColumnDistance(candidates, prefCol){
  return candidates.sort((a,b)=>Math.abs(parseInt(a.replace(/^[A-Z]+/,''))-prefCol)-Math.abs(parseInt(b.replace(/^[A-Z]+/,''))-prefCol));
}

async function run(){
  await connect();
  const events = await Event.find();
  const EventsBackup = mongoose.connection.collection('events_enforce_backup');
  const BookingsBackup = mongoose.connection.collection('bookings_enforce_backup');
  const report = [];

  for (const ev of events) {
    const layoutKey = Object.keys(auditoriumLayouts).find(k=>k.toLowerCase()===String(ev.auditorium||'').trim().toLowerCase());
    if(!layoutKey){ report.push({ event: ev._id, reason: 'no layout' }); continue; }
    const layout = auditoriumLayouts[layoutKey];
    const canonical = generateCanonical(layout);

    // Collect all bookings for event
    const bookings = await Booking.find({ event: ev._id }).sort({ createdAt: 1 });
    const totalBookedSeats = bookings.reduce((sum,b)=>sum + (b.seatNumbers?.length || 0),0);

    if (totalBookedSeats > canonical.length) {
      report.push({ event: ev._id, reason: 'overbooked', totalBookedSeats, capacity: canonical.length });
      console.log(`Skipping event ${ev._id}: ${totalBookedSeats} booked seats > capacity ${canonical.length}`);
      continue; // cannot safely remap without data loss
    }

    // Backup
    await EventsBackup.insertOne(ev.toObject());
    if (bookings.length) await BookingsBackup.insertMany(bookings.map(b=>b.toObject()));

    // Assign seats: iterate bookings, for each requested seat count assign nearest available seats
    const available = new Set(canonical);
    const assignedPerBooking = {};

    for (const b of bookings) {
      const assigned = [];
      // try to honor original seat preferences if possible
      for (const orig of b.seatNumbers) {
        const p = seatParts(orig);
        let candidates = Array.from(available).filter(s=>s.startsWith(p?.row || ''));
        if (candidates.length) {
          candidates = sortByColumnDistance(candidates, p?.col || 1);
          assigned.push(candidates[0]);
          available.delete(candidates[0]);
          continue;
        }
        // else pick any nearest: choose by row order then column
        const any = Array.from(available).sort((x,y)=> {
          const xp = seatParts(x), yp = seatParts(y);
          if (xp.row === yp.row) return xp.col - yp.col;
          return xp.row.localeCompare(yp.row);
        });
        if (any.length) {
          assigned.push(any[0]); available.delete(any[0]);
        }
      }
      // if booking requested more seats than mapped (shouldn't), fill from available
      while (assigned.length < (b.seatNumbers?.length || 0)) {
        const any = Array.from(available).sort();
        if (!any.length) break;
        assigned.push(any[0]); available.delete(any[0]);
      }
      assignedPerBooking[b._id] = assigned;
    }

    // Apply assignments to Booking docs
    for (const b of bookings) {
      const assigned = assignedPerBooking[b._id] || [];
      b.seatNumbers = assigned;
      await b.save();
    }

    // Build new event.seats as canonical with isBooked if assigned
    const assignedAll = new Set(Object.values(assignedPerBooking).flat());
    const newSeats = canonical.map(s => ({ seatNumber: s, isBooked: assignedAll.has(s) }));

    ev.seats = newSeats;
    ev.auditorium = layoutKey; // normalize name
    await ev.save();
    report.push({ event: ev._id, remappedBookings: bookings.length, assignedSeats: assignedAll.size });
    console.log(`Event ${ev._id}: remapped ${bookings.length} bookings -> ${assignedAll.size} seats`);
  }

  console.log('Enforcement complete');
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
