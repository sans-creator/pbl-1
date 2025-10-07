import Event from "../models/Event.js";

// GET /api/admin/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/events
export const createEvent = async (req, res) => {
  try {
    const { title, description, auditorium, date, seats } = req.body;
    const event = new Event({ title, description, auditorium, date, seats });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const { title, description, auditorium, date, updatedSeats } = req.body;
    event.title = title || event.title;
    event.description = description || event.description;
    event.auditorium = auditorium || event.auditorium;
    event.date = date || event.date;

    // Update seats (mark/unmark selected seats)
    if (updatedSeats && updatedSeats.length) {
      updatedSeats.forEach((seatNum) => {
        const seat = event.seats.find((s) => s.seatNumber === seatNum);
        if (seat && !seat.isBooked) {
          seat.isBooked = true;
        }
      });
    }

    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete event (Admin only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await Event.findByIdAndDelete(id);

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
