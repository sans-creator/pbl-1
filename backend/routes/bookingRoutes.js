// backend/routes/bookingRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { createBooking, getAllBookings } from "../controllers/bookingController.js";

const router = express.Router();

// User booking
router.post("/", protect, createBooking);

// Also support POST /api/events/:id/book for backward-compatible client calls
router.post("/:id/book", protect, (req, res, next) => {
	// map to the controller's expected shape: { eventId, seatNumbers }
	req.body.eventId = req.params.id;
	req.body.seatNumbers = req.body.seats || req.body.seatNumbers;
	return createBooking(req, res, next);
});

// Admin view all bookings
router.get("/", protect, admin, getAllBookings);

export default router;




