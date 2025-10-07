import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  row: Number,
  column: Number
});

const auditoriumSchema = new mongoose.Schema({
  name: { type: String, enum: ["TMA PAI", "RAMDAS PAI", "SHARDA PAI"], required: true },
  totalSeats: Number,
  seatLayout: [seatSchema]
});

export default mongoose.models.Auditorium || mongoose.model("Auditorium", auditoriumSchema);
