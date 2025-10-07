// src/components/SeatLayout.jsx
import React from "react";

export default function SeatLayout({
  rows,
  columns,
  occupiedSeats = [],
  selectedSeats = [],
  highlightedSeats = [],
  maxSelection = 5,
  onSelect,
}) {
  const handleClick = (seat) => {
    if (occupiedSeats.includes(seat)) return; // already booked
    if (selectedSeats.includes(seat)) {
      onSelect(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < maxSelection) {
      onSelect([...selectedSeats, seat]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row} className="flex gap-2">
          {Array.from({ length: columns }, (_, i) => {
            const seat = `${row}${i + 1}`;
            const isOccupied = occupiedSeats.includes(seat);
            const isSelected = selectedSeats.includes(seat);
            const isHighlighted = highlightedSeats.includes(seat);

            return (
              <button
                key={seat}
                onClick={() => handleClick(seat)}
                disabled={isOccupied}
                className={`w-10 h-10 rounded text-white font-bold transition-colors duration-150 ${
                  isOccupied
                    ? "bg-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-green-500"
                    : "bg-orange-600 hover:bg-orange-700"
                } ${isHighlighted ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
              >
                {seat}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
