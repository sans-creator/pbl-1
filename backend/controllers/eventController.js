import Event from "../models/Event.js";
import { sendEmail } from "../utils/sendEmail.js";
import { auditoriumLayouts } from "../config/auditoriumLayouts.js";
import Booking from "../models/Booking.js";
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, auditorium } = req.body;

    if (!auditorium) {
      return res
        .status(400)
        .json({ success: false, message: "Auditorium is required" });
    }

    // Match key in a case-insensitive way
    const layoutKey = Object.keys(auditoriumLayouts).find(
      (key) => key.toLowerCase() === auditorium.trim().toLowerCase()
    );
    const layout = auditoriumLayouts[layoutKey];

    if (!layout) {
      return res.status(400).json({
        success: false,
        message: `Invalid auditorium name: ${auditorium}`,
      });
    }

    // 🪑 Generate seats from layout
    const seats = [];
    layout.rows.forEach(({ rowLabel, seats: seatCount }) => {
      for (let i = 1; i <= seatCount; i++) {
        seats.push({ seatNumber: `${rowLabel}${i}`, isBooked: false });
      }
    });

    const event = new Event({
      title,
      description,
      date,
      auditorium: layoutKey, // Use consistent naming
      seats,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully with predefined layout",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get seats for an event
export const getEventSeats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Get all booked seats from bookings
    const bookings = await Booking.find({ event: event._id });
    const bookedSeats = bookings.flatMap(b => b.seatNumbers);

    const seats = event.seats.map(seat => ({
      seatNumber: seat.seatNumber,
      isBooked: bookedSeats.includes(seat.seatNumber),
    }));

    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      auditorium: event.auditorium,
      seats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Book seats and send email
export const bookSeats = async (req, res) => {
  const { seats } = req.body;
  const userEmail = req.user?.email;
  if (!seats || !seats.length)
    return res
      .status(400)
      .json({ success: false, message: "No seats selected" });

  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // Check if seats are already booked
    const alreadyBooked = seats.filter((s) =>
      event.seats.some((seat) => seat.seatNumber === s && seat.isBooked)
    );
    if (alreadyBooked.length) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(", ")}`,
      });
    }

    // Mark seats as booked
    event.seats.forEach((seat) => {
      if (seats.includes(seat.seatNumber)) seat.isBooked = true;
    });

    await event.save();

    // Send confirmation email
    if (userEmail) {
      const subject = `Booking Confirmation for ${event.title}`;
      const text = `Your booking for ${event.title} on ${event.date.toLocaleString()} is confirmed. Seats: ${seats.join(", ")}`;
      const html = `<h2>Booking Confirmation</h2>
                    <p>Event: ${event.title}</p>
                    <p>Date: ${event.date.toLocaleString()}</p>
                    <p>Seats: ${seats.join(", ")}</p>`;
      await sendEmail(userEmail, subject, text, html);
    }

    res.json({ success: true, bookedSeats: seats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
};
