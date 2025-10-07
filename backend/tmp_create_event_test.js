import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function run(){
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  const layoutKey = 'TMA PAI';
  const layout = auditoriumLayouts[layoutKey];
  const seats = [];
  layout.rows.forEach(r=>{ for(let i=1;i<=r.seats;i++) seats.push({ seatNumber:`${r.rowLabel}${i}`, isBooked:false }) });
  const ev = new Event({ title:'tmp test', description:'desc', date:new Date(), auditorium:layoutKey, layoutKey, seats });
  await ev.save();
  console.log('Saved event', ev._id);
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
