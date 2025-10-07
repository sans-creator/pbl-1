// backend/controllers/bookingController.js
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// POST /api/events/:id/book
// backend/controllers/bookingController.js


// POST /api/bookings or /api/events/:id/book
export const createBooking = async (req, res) => {
  const eventId = req.body.eventId || req.params.id;
  const seatNumbers = req.body.seatNumbers || req.body.seats || [];
  const userId = req.user?._id;

  console.log("Booking request:", { eventId, seatNumbers, userId });
  console.log("Booking request:", {
  eventId: req.body.eventId || req.params.id,
  seatNumbers: req.body.seatNumbers || req.body.seats,
  userId: req.user?._id
});

  if (!eventId || !seatNumbers.length) {
    return res.status(400).json({ message: "Event ID and seats are required" });
  }

  try {
    // Fetch the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Normalize seat numbers to uppercase and trim
    const normalizedSeats = seatNumbers.map(s => s.trim().toUpperCase());

  // Diagnostic: print event seats summary and requested seats
  console.log('Event seats snapshot:', event.seats.map(se => ({ seatNumber: se.seatNumber, isBooked: !!se.isBooked })));
  console.log('Requested (normalized):', normalizedSeats);

    // Check availability
    // Determine which requested seats exist, which are invalid, and which are already booked
    const seatMap = new Map();
    event.seats.forEach((s) => seatMap.set(String(s.seatNumber).trim().toUpperCase(), s));

    const invalidSeats = [];
    const alreadyBooked = [];
    const toBook = [];

    normalizedSeats.forEach((seatNum) => {
      const seat = seatMap.get(seatNum);
      if (!seat) invalidSeats.push(seatNum);
      else if (seat.isBooked) alreadyBooked.push(seatNum);
      else toBook.push(seatNum);
    });

    let booking = null;

    if (toBook.length > 0) {
      // Mark only available seats as booked
      event.seats.forEach((seat) => {
        const sId = String(seat.seatNumber).trim().toUpperCase();
        if (toBook.includes(sId)) {
          seat.isBooked = true;
          seat.bookedBy = userId;
        }
      });

      await event.save();

      // Create Booking document for the seats that were actually booked
      booking = await Booking.create({
        user: userId,
        event: event._id,
        seatNumbers: toBook,
      });

      // Send confirmation email for booked seats (fire-and-forget)
      const user = await User.findById(userId);
      if (user?.email) {
        const subject = `Booking Confirmation — ${event.title}`;
        const text = `Hi ${user.name || ''},\n\nYour booking for ${event.title} on ${new Date(event.date).toLocaleString()} is confirmed. Seats: ${toBook.join(", ")}.`;
        const html = `<h2>Booking Confirmation</h2>
                      <p>Event: ${event.title}</p>
                      <p>Date: ${new Date(event.date).toLocaleString()}</p>
                      <p>Seats: ${toBook.join(", ")}</p>`;
        sendEmail(user.email, subject, text, html).catch(err => console.error("Email send failed", err));
      }
    }

    // Return structured result; do not return 400 for already-booked seats
    return res.status(200).json({
      success: toBook.length > 0,
      bookedSeats: toBook,
      alreadyBooked,
      invalidSeats,
      booking,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};


// GET /api/bookings (admin view)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("event", "title date auditorium seats");
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
