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
  // layoutKey refers to a key in backend/config/auditoriumLayouts.js
  layoutKey: { type: String, default: null },
  // optional per-event overrides: { rows: [{ rowLabel, seats }] }
  layoutOverrides: { type: mongoose.Schema.Types.Mixed, default: null },
  seats: [seatSchema]
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
