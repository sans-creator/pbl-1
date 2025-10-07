import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect() { await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj'); console.log('Connected'); }

function generateCanonical(layout) {
  const seats = [];
  layout.rows.forEach(r => { for (let c=1; c<=r.seats; c++) seats.push(`${r.rowLabel}${c}`); });
  return seats;
}

function seatParts(seat){ const m=seat.match(/^([A-Z]+)(\d+)$/i); return m?{row:m[1].toUpperCase(),col:parseInt(m[2],10)}:null }

function findAnyFree(canonicalSeats, taken){ return canonicalSeats.find(s=>!taken.has(s)) || null }

async function run(){
  await connect();
  const events = await Event.find();
  const EventsBackup = mongoose.connection.collection('events_force_remap_backup');
  const BookingsBackup = mongoose.connection.collection('bookings_force_remap_backup');

  for (const ev of events){
    const layoutKey = Object.keys(auditoriumLayouts).find(k=>k.toLowerCase()===String(ev.auditorium||'').trim().toLowerCase());
    if(!layoutKey) continue;
    const layout = auditoriumLayouts[layoutKey];
    const canonical = generateCanonical(layout);
    const canonicalSet = new Set(canonical);

    const actual = (ev.seats||[]).map(s=>s.seatNumber);
    const extras = actual.filter(s=>!canonicalSet.has(s));
    const extraBooked = (ev.seats||[]).filter(s=>extras.includes(s.seatNumber) && s.isBooked).map(s=>s.seatNumber);
    if(extraBooked.length===0) continue;

    console.log(`Event ${ev._id} extras booked:`, extraBooked);
    await EventsBackup.insertOne(ev.toObject());
    const relatedBookings = await Booking.find({ event: ev._id, seatNumbers: { $in: extraBooked } }).lean();
    if(relatedBookings.length) await BookingsBackup.insertMany(relatedBookings);

    // build taken set from canonical seats based on existing bookings and event.seats
    const taken = new Set();
    (ev.seats||[]).forEach(s=>{ if(canonicalSet.has(s.seatNumber) && s.isBooked) taken.add(s.seatNumber); });

    // For each extraBooked seat, try to find free canonical and remap booking
    for(const oldSeat of extraBooked){
      const bookings = await Booking.find({ event: ev._id, seatNumbers: oldSeat });
      // find free canonical
      const newSeat = findAnyFree(canonical, taken);
      if(!newSeat){
        console.log(`  No free canonical seat to remap ${oldSeat} for event ${ev._id}; will preserve as extra`);
        continue;
      }
      console.log(`  Remapping ${oldSeat} -> ${newSeat}`);
      // update bookings
      for(const b of bookings){
        b.seatNumbers = b.seatNumbers.map(sn => sn===oldSeat? newSeat: sn);
        await b.save();
      }
      taken.add(newSeat);
      // remove old extra seat from event.seats and ensure newSeat marked booked
      ev.seats = (ev.seats||[]).filter(s=>s.seatNumber!==oldSeat);
      // mark newSeat as booked in ev.seats (if exists) or append
      let found=false;
      for(const s of ev.seats){ if(s.seatNumber===newSeat){ s.isBooked=true; found=true; break; } }
      if(!found) ev.seats.push({ seatNumber:newSeat, isBooked:true });
    }

    // Now ensure event.seats contains canonical seats (fill any missing canonical seats as not booked)
    const canonicalSeatsObjs = canonical.map(sn => ({ seatNumber: sn, isBooked: ev.seats.some(s=>s.seatNumber===sn && s.isBooked) }));
    // Preserve any remaining extras that are booked (if could not remap)
    const remainingExtras = (ev.seats||[]).filter(s=>!canonicalSet.has(s.seatNumber) && s.isBooked).map(s=>({ seatNumber: s.seatNumber, isBooked: true }));
    ev.seats = [...canonicalSeatsObjs, ...remainingExtras];

    await ev.save();
    console.log(`  Updated event ${ev._id}`);
  }
  console.log('Force-remap complete');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
