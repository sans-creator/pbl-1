import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  auditorium: { type: String, required: true, trim: true },
  seats: [seatSchema]
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
