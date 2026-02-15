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

// Middleware setup
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL (Vite default)
  credentials: true
}));
app.use(express.json());

// ✅ MongoDB connection FIRST
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // ✅ Only load routes after successful DB connection
    app.use("/api/auth", authRoutes);
    app.use("/api/auditoriums", auditoriumRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/events", bookingRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/admin", adminRoutes);

    // Error middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1); // stop server if DB fails
  });
