import React, { useState } from "react";
import SeatLayout from "../components/SeatLayout";

const auditoriumConfig = {
  "TMA Pai": { rows: ["A", "B", "C", "D"], columns: 10 },
  "Ramdas Pai": { rows: ["A", "B", "C", "D", "E"], columns: 12 },
  "Sharda Pai": { rows: ["A", "B", "C", "D", "E", "F"], columns: 15 },
};

export default function BookingPage({ auditoriumName, occupiedSeats = [] }) {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSelectSeats = (seats) => {
    setSelectedSeats(seats);
  };

  const config = auditoriumConfig[auditoriumName];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{auditoriumName} Seat Selection</h1>
      <SeatLayout
        rows={config.rows}
        columns={config.columns}
        occupiedSeats={occupiedSeats}
        maxSelection={5}
        onSelect={handleSelectSeats}
      />
      <p className="mt-4">Selected Seats: {selectedSeats.join(", ")}</p>
    </div>
  );
}
