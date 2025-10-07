import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  seatNumbers: [{ type: String, required: true }],
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
