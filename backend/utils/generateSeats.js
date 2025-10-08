import { auditoriumLayouts } from "./auditoriumLayouts.js";

export const generateSeatsForEvent = (auditoriumName) => {
  const layout = auditoriumLayouts[auditoriumName];
  if (!layout) return []; // fallback if auditorium not found

  const seats = [];
  layout.rows.forEach((row) => {
    for (let i = 1; i <= row.seats; i++) {
      seats.push({
        seatNumber: `${row.rowLabel}${i}`,
        isBooked: false,
      });
    }
  });

  return seats;
};
