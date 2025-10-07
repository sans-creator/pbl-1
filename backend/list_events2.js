import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

async function run(){
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  const events = await Event.find().lean();
  console.log('Found', events.length, 'events');
  for(const e of events){
    const seats = (e.seats||[]).map(s=>s.seatNumber);
    console.log('---');
    console.log('id:', String(e._id));
    console.log('title:', e.title);
    console.log('auditorium:', e.auditorium);
    console.log('seats count:', seats.length);
    console.log('first seats:', seats.slice(0,30));
  }
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
