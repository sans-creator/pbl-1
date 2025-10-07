// backend/routes/adminRoutes.js
import express from "express";
import {
  createEvent,
  getEvents,
  deleteEvent,
  getEventById,
  updateEvent,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(protect); // Must be logged in
router.use(admin);   // Must be an admin

// Admin CRUD routes
router.get("/events", getEvents);           // GET all events
router.post("/events", createEvent);        // CREATE new event
router.get("/events/:id", getEventById);    // GET single event by ID
router.put("/events/:id", updateEvent);     // UPDATE event by ID
router.delete("/events/:id", deleteEvent);  // DELETE event by ID

export default router;
