import express from "express";
import {
  createEvent,       // ✅ new controller
  getEvents,
  getEventById,
  getEventSeats,
  bookSeats,
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent);

router.get("/", getEvents);          
router.get("/:id", getEventById);    
router.get("/:id/seats", getEventSeats); 
// Note: booking is handled by the protected bookingRoutes which creates Booking records.
// The unprotected event-level booking endpoint caused inconsistent state (Event.seats updated
// without creating Booking documents). Remove the direct event-level booking route so the
// protected booking route from bookingRoutes will be used instead.

export default router;
