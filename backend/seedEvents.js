// backend/seedEvents.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./models/Event.js";

dotenv.config(); // load .env file

const MONGO_URI = process.env.MONGODB_URI;

const seedEvents = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Remove old data if you want fresh entries
    await Event.deleteMany();

    // Sample events
    await Event.insertMany([
      {
        title: "Freshers Welcome 2025",
        description: "Welcome event for first-year students!",
        date: new Date("2025-10-20T18:00:00"),
        auditorium: "TMA Pai",
        seats: Array.from({ length: 30 }, (_, i) => ({
          seatNumber: `A${i + 1}`,
        })),
      },
      {
        title: "Tech Symposium",
        description: "Annual inter-college technical fest.",
        date: new Date("2025-11-02T10:00:00"),
        auditorium: "Ramdas Pai",
        seats: Array.from({ length: 25 }, (_, i) => ({
          seatNumber: `B${i + 1}`,
        })),
      },
    ]);

    console.log("🎉 Sample events added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    process.exit(1);
  }
};

seedEvents();
