import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

const generateSeats = (aud) => {
  const key = Object.keys(auditoriumLayouts).find(k => k.toLowerCase() === (aud || '').trim().toLowerCase());
  if (!key) return null;
  const layout = auditoriumLayouts[key];
  const seats = [];
  layout.rows.forEach(r => {
    for (let i = 1; i <= r.seats; i++) seats.push(`${r.rowLabel}${i}`);
  });
  return seats;
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const events = await Event.find();
  for (const ev of events) {
    console.log('\nProcessing event', ev._id, ev.title, ev.auditorium);

    const expected = generateSeats(ev.auditorium || '');
    if (!expected) {
      console.log('  Unknown auditorium, skipping');
      continue;
    }

    // Backup original event
    await mongoose.connection.collection('events_backup').insertOne({ original: ev.toObject(), migratedAt: new Date() });
    console.log('  Backed up original event');

    // Find bookings for this event
    const bookings = await Booking.find({ event: ev._id });
    const bookedSeatSet = new Set(bookings.flatMap(b => b.seatNumbers.map(s => String(s).trim().toUpperCase())));

    // Build new seats array from expected layout, marking booked where found
    const newSeats = expected.map(sn => ({ seatNumber: sn, isBooked: bookedSeatSet.has(sn), bookedBy: null }));

    // Any booked seats not in expected layout: append them (to avoid losing bookings)
    const extras = [...bookedSeatSet].filter(s => !expected.includes(s));
    if (extras.length) {
      console.log('  Found booked seats not in layout, appending:', extras);
      extras.forEach(s => newSeats.push({ seatNumber: s, isBooked: true, bookedBy: null }));
    }

    // Save
    ev.seats = newSeats;
    await ev.save();
    console.log('  Event seats replaced; total seats:', newSeats.length);
  }

  console.log('\nMigration complete');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
