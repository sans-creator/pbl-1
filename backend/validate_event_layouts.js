import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

const generateSeats = (aud) => {
  const key = Object.keys(auditoriumLayouts).find(k => k.toLowerCase() === aud.trim().toLowerCase());
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
  console.log('Connected');
  const events = await Event.find();
  for (const ev of events) {
    const expected = generateSeats(ev.auditorium || '');
    if (!expected) {
      console.log(ev._id, 'unknown auditorium', ev.auditorium);
      continue;
    }
    const actual = (ev.seats || []).map(s => String(s.seatNumber).trim().toUpperCase());
    const missing = expected.filter(e => !actual.includes(e));
    const extra = actual.filter(a => !expected.includes(a));
    if (missing.length || extra.length) {
      console.log('Event', ev._id, 'layout mismatch');
      if (missing.length) console.log('  missing:', missing.slice(0,20));
      if (extra.length) console.log('  extra:', extra.slice(0,20));
    }
  }
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
