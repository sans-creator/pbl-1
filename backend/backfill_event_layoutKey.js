import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect(){ await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj'); console.log('Connected'); }

function generateSeatsFromLayout(layout){ const seats=[]; layout.rows.forEach(r=>{ for(let c=1;c<=r.seats;c++) seats.push({ seatNumber:`${r.rowLabel}${c}`, isBooked:false }); }); return seats; }

async function run(){ await connect(); const events = await Event.find(); const backups = mongoose.connection.collection('events_layout_backups'); let updated=0; for(const ev of events){ const layoutKey = Object.keys(auditoriumLayouts).find(k=>k.toLowerCase()===String(ev.auditorium||'').trim().toLowerCase()) || null; await backups.insertOne(ev.toObject()); if(!ev.layoutKey || ev.layoutKey !== layoutKey){ ev.layoutKey = layoutKey; }
    if((!ev.seats || ev.seats.length===0) && layoutKey){ const layout = auditoriumLayouts[layoutKey]; ev.seats = generateSeatsFromLayout(layout); }
    await ev.save(); updated++; }
 console.log('Backfill complete. Events processed:', updated); process.exit(0); }

run().catch(err=>{ console.error(err); process.exit(1); });
