import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';

dotenv.config();

async function run(){
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/muj');
  const seats = ['A23','A16'];
  const bookings = await Booking.find({ seatNumbers: { $in: seats } }).lean();
  console.log(JSON.stringify(bookings, null, 2));
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
