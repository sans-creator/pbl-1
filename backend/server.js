
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
// Routes
import authRoutes from "./routes/authRoutes.js";
import auditoriumRoutes from "./routes/auditoriumRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL (Vite default)
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auditoriums", auditoriumRoutes);
app.use("/api/events", eventRoutes);
// Also mount booking routes under /api/events so POST /api/events/:id/book works
app.use("/api/events", bookingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Error middleware
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
