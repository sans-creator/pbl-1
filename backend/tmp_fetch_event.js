import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

async function run(){
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  const ev = await Event.findById('68e5080f5ef486e1b56db639').lean();
  console.log(JSON.stringify({ id: ev._id, auditorium: ev.auditorium, layoutKey: ev.layoutKey, seatsCount: (ev.seats||[]).length, firstSeats: (ev.seats||[]).slice(0,12).map(s=>s.seatNumber) }, null, 2));
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
