import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Booking from './models/Booking.js';

dotenv.config();

async function run(){
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  const events = await Event.find().lean();
  for(const e of events){
    const bookings = await Booking.find({ event: e._id }).lean();
    const totalBookedSeats = bookings.reduce((s,b)=>s + (b.seatNumbers?.length || 0), 0);
    console.log(`Event ${e._id} - ${e.title} - auditorium=${e.auditorium} - capacity=${(e.seats||[]).length} - bookings=${bookings.length} - totalBookedSeats=${totalBookedSeats}`);
  }
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
