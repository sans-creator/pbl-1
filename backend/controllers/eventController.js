import Event from "../models/Event.js";
import { sendEmail } from "../utils/sendEmail.js";
import { auditoriumLayouts } from "../config/auditoriumLayouts.js";
import Booking from "../models/Booking.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, auditorium, layoutKey: requestedLayoutKey, layoutOverrides } = req.body;

    if (!auditorium) {
      return res.status(400).json({ success: false, message: "Auditorium is required" });
    }

    let layoutKey = null;
    if (requestedLayoutKey) {
      layoutKey = Object.keys(auditoriumLayouts).find(
        k => k.toLowerCase() === requestedLayoutKey.trim().toLowerCase()
      );
      if (!layoutKey) return res.status(400).json({ success: false, message: `Invalid layoutKey: ${requestedLayoutKey}` });
    } else {
      layoutKey = Object.keys(auditoriumLayouts).find(
        k => k.toLowerCase() === auditorium.trim().toLowerCase()
      );
    }

    let seats = [];
    if (layoutOverrides && Array.isArray(layoutOverrides.rows) && layoutOverrides.rows.length) {
      layoutOverrides.rows.forEach(r => {
        for (let i = 1; i <= r.seats; i++) seats.push({ seatNumber: `${r.rowLabel}${i}`, isBooked: false });
      });
    } else if (layoutKey) {
      const layout = auditoriumLayouts[layoutKey];
      layout.rows.forEach(({ rowLabel, seats: seatCount }) => {
        for (let i = 1; i <= seatCount; i++) seats.push({ seatNumber: `${rowLabel}${i}`, isBooked: false });
      });
    } else {
      const fallbackLayoutKey = Object.keys(auditoriumLayouts).find(
        k => k.toLowerCase() === auditorium.trim().toLowerCase()
      );
      if (fallbackLayoutKey) {
        const fallbackLayout = auditoriumLayouts[fallbackLayoutKey];
        fallbackLayout.rows.forEach(({ rowLabel, seats: seatCount }) => {
          for (let i = 1; i <= seatCount; i++) seats.push({ seatNumber: `${rowLabel}${i}`, isBooked: false });
        });
        layoutKey = fallbackLayoutKey;
      }
    }

    const event = new Event({
      title,
      description,
      date,
      auditorium: layoutKey || auditorium.trim(),
      layoutKey: layoutKey || null,
      layoutOverrides: layoutOverrides || null,
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

// Get all predefined auditorium layouts
export const getAuditoriumLayouts = async (req, res) => {
  try {
    res.json({ success: true, layouts: auditoriumLayouts });
  } catch (err) {
    console.error('Error fetching layouts', err);
    res.status(500).json({ success: false, message: 'Server error' });
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

    const bookings = await Booking.find({ event: event._id });
    const bookedSeats = bookings.flatMap(b => b.seatNumbers);

    if (!event.seats || event.seats.length === 0) {
      const layoutKey = event.layoutKey || Object.keys(auditoriumLayouts).find(
        (key) => key.toLowerCase() === String(event.auditorium || '').trim().toLowerCase()
      );
      const layout = auditoriumLayouts[layoutKey];
      event.seats = [];
      if (layout) {
        layout.rows.forEach(({ rowLabel, seats: seatCount }) => {
          for (let i = 1; i <= seatCount; i++) {
            event.seats.push({ seatNumber: `${rowLabel}${i}`, isBooked: bookedSeats.includes(`${rowLabel}${i}`) });
          }
        });
      }
      await event.save();
    }

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
  const { seats: requestedSeats } = req.body;
  const userEmail = req.user?.email;

  if (!requestedSeats || !requestedSeats.length)
    return res.status(400).json({ success: false, message: "No seats selected" });

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!event.seats || event.seats.length === 0) {
      const layoutKey = event.layoutKey || Object.keys(auditoriumLayouts).find(
        k => k.toLowerCase() === (event.auditorium || '').trim().toLowerCase()
      );
      if (!layoutKey) return res.status(400).json({ success: false, message: "No seat layout found for this auditorium" });

      const layout = auditoriumLayouts[layoutKey];
      event.seats = [];
      layout.rows.forEach(({ rowLabel, seats: seatCount }) => {
        for (let i = 1; i <= seatCount; i++) {
          event.seats.push({ seatNumber: `${rowLabel}${i}`, isBooked: false });
        }
      });
      await event.save();
    }

    const normalizedSeats = requestedSeats.map(s => s.trim().toUpperCase());

    const invalidSeats = normalizedSeats.filter(s =>
      !event.seats.some(seat => seat.seatNumber === s)
    );
    if (invalidSeats.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid seats: ${invalidSeats.join(", ")}. Seats have been refreshed. Please choose other seats.`
      });
    }

    const alreadyBooked = normalizedSeats.filter(s =>
      event.seats.some(seat => seat.seatNumber === s && seat.isBooked)
    );
    if (alreadyBooked.length) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(", ")}`
      });
    }

    event.seats.forEach(seat => {
      if (normalizedSeats.includes(seat.seatNumber)) seat.isBooked = true;
    });

    await event.save();

    if (userEmail) {
      const subject = `Booking Confirmation for ${event.title}`;
      const text = `Your booking for ${event.title} on ${event.date.toLocaleString()} is confirmed. Seats: ${normalizedSeats.join(", ")}`;
      const html = `<h2>Booking Confirmation</h2>
                    <p>Event: ${event.title}</p>
                    <p>Date: ${event.date.toLocaleString()}</p>
                    <p>Seats: ${normalizedSeats.join(", ")}</p>`;
      await sendEmail(userEmail, subject, text, html);
    }

    res.json({ success: true, bookedSeats: normalizedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
};

// Admin: update event layout
export const updateEventLayout = async (req, res) => {
  try {
    const { layoutKey: newLayoutKey, layoutOverrides } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    let newSeatsList = [];
    if (layoutOverrides && Array.isArray(layoutOverrides.rows) && layoutOverrides.rows.length) {
      layoutOverrides.rows.forEach(r => { for (let i = 1; i <= r.seats; i++) newSeatsList.push(`${r.rowLabel}${i}`); });
    } else if (newLayoutKey) {
      const layout = auditoriumLayouts[Object.keys(auditoriumLayouts).find(k=>k.toLowerCase()===newLayoutKey.trim().toLowerCase())];
      if (!layout) return res.status(400).json({ success: false, message: 'Invalid layoutKey' });
      layout.rows.forEach(r => { for (let i = 1; i <= r.seats; i++) newSeatsList.push(`${r.rowLabel}${i}`); });
    } else {
      return res.status(400).json({ success: false, message: 'Provide layoutKey or layoutOverrides' });
    }

    const bookings = await Booking.find({ event: event._id }).sort({ createdAt: 1 });
    const totalBookedSeats = bookings.reduce((s,b)=>s + (b.seatNumbers?.length || 0), 0);
    if (totalBookedSeats > newSeatsList.length) return res.status(400).json({ success: false, message: 'New layout capacity too small for existing bookings' });

    const available = new Set(newSeatsList);
    for (const b of bookings) {
      const assigned = [];
      for (const orig of b.seatNumbers) {
        const row = (orig.match(/^([A-Z]+)/) || [])[1];
        let candidates = Array.from(available).filter(s=>s.startsWith(row));
        if (candidates.length) { assigned.push(candidates[0]); available.delete(candidates[0]); continue; }
        const any = Array.from(available).sort();
        assigned.push(any[0]); available.delete(any[0]);
      }
      b.seatNumbers = assigned;
      await b.save();
    }

    const assignedAll = new Set(bookings.flatMap(b => b.seatNumbers || []));
    event.seats = newSeatsList.map(s => ({ seatNumber: s, isBooked: assignedAll.has(s) }));
    event.layoutKey = newLayoutKey || event.layoutKey;
    event.layoutOverrides = layoutOverrides || null;
    event.auditorium = event.layoutKey || event.auditorium;
    await event.save();

    res.json({ success: true, message: 'Event layout updated', event });
  } catch (err) {
    console.error('Error updating event layout', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
