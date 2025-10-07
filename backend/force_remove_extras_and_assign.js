import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import { auditoriumLayouts } from './config/auditoriumLayouts.js';

dotenv.config();

async function connect(){ await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj'); console.log('Connected'); }

function genCanonical(layout){ const seats=[]; layout.rows.forEach(r=>{ for(let c=1;c<=r.seats;c++) seats.push(`${r.rowLabel}${c}`); }); return seats; }

function seatParts(seat){ const m=seat.match(/^([A-Z]+)(\d+)$/i); return m?{row:m[1].toUpperCase(),col:parseInt(m[2],10)}:null }

function sortByCol(cands, pref){ return cands.sort((a,b)=>Math.abs(parseInt(a.replace(/^[A-Z]+/,''))-pref)-Math.abs(parseInt(b.replace(/^[A-Z]+/,''))-pref)); }

async function run(){ await connect(); const events=await Event.find(); const EBackup=mongoose.connection.collection('events_force_remove_backup'); const BBackup=mongoose.connection.collection('bookings_force_remove_backup'); const report=[];

 for(const ev of events){
   const layoutKey = Object.keys(auditoriumLayouts).find(k=>k.toLowerCase()===String(ev.auditorium||'').trim().toLowerCase());
   if(!layoutKey){ report.push({ event:ev._id, reason:'no layout' }); continue; }
   const layout = auditoriumLayouts[layoutKey]; const canonical = genCanonical(layout);
   const bookings = await Booking.find({ event: ev._id }).sort({ createdAt:1 });
   const totalBookedSeats = bookings.reduce((s,b)=>s + (b.seatNumbers?.length||0),0);
   if(totalBookedSeats > canonical.length){ report.push({ event: ev._id, reason:'overbooked', totalBookedSeats, capacity: canonical.length}); console.log('Skipping',ev._id,'overbooked'); continue; }

   await EBackup.insertOne(ev.toObject()); if(bookings.length) await BBackup.insertMany(bookings.map(b=>b.toObject()));

   const available = new Set(canonical);
   const assignment = {};
   for(const b of bookings){
     const assigned = [];
     for(const orig of b.seatNumbers){
       const p = seatParts(orig);
       let candidates = Array.from(available).filter(s=>p && s.startsWith(p.row));
       if(candidates.length){ candidates = sortByCol(candidates, p.col); assigned.push(candidates[0]); available.delete(candidates[0]); continue; }
       const any = Array.from(available).sort((x,y)=>{ const xp=seatParts(x), yp=seatParts(y); if(xp.row===yp.row) return xp.col-yp.col; return xp.row.localeCompare(yp.row); });
       if(any.length){ assigned.push(any[0]); available.delete(any[0]); }
     }
     while(assigned.length < (b.seatNumbers?.length||0)){ const any=Array.from(available).sort(); if(!any.length) break; assigned.push(any[0]); available.delete(any[0]); }
     assignment[b._id] = assigned; b.seatNumbers = assigned; await b.save();
   }

   const assignedAll = new Set(Object.values(assignment).flat());
   const newSeats = canonical.map(s=>({ seatNumber: s, isBooked: assignedAll.has(s) }));
   ev.seats = newSeats; ev.auditorium = layoutKey; await ev.save();
   report.push({ event: ev._id, assignedSeats: assignedAll.size, bookings: bookings.length });
   console.log('Updated',ev._id,'assigned',assignedAll.size);
 }
 console.log('Done'); console.log(JSON.stringify(report,null,2)); process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
