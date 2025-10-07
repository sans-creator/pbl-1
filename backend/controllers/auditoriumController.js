import Auditorium from "../models/Auditorium.js";

// Get all auditoriums
export const getAuditoriums = async (req, res) => {
  const auditoriums = await Auditorium.find();
  res.json(auditoriums);
};

// Add auditorium (admin)
export const addAuditorium = async (req, res) => {
  const { name, totalSeats, seatLayout } = req.body;
  const auditorium = await Auditorium.create({ name, totalSeats, seatLayout });
  res.status(201).json(auditorium);
};
