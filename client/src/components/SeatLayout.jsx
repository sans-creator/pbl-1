import React from "react";

const SeatLayout = ({ rows, columns, occupiedSeats, selectedSeats, highlightedSeats = [], maxSelection, onSelect }) => {
  const handleSeatClick = (seatNumber) => {
    const upperSeat = seatNumber.toUpperCase();
    if (occupiedSeats.includes(upperSeat)) return; // booked
    if (selectedSeats.includes(upperSeat)) {
      onSelect(selectedSeats.filter(s => s !== upperSeat));
    } else {
      if (selectedSeats.length < maxSelection) {
        onSelect([...selectedSeats, upperSeat]);
      }
    }
  };

  const renderSeat = (row, col) => {
    const seatNumber = `${row}${col}`;
    const upperSeat = seatNumber.toUpperCase();
    let bgColor = "bg-green-500"; // available

    if (occupiedSeats.includes(upperSeat)) bgColor = "bg-gray-400";
    else if (selectedSeats.includes(upperSeat)) bgColor = "bg-yellow-400";
    else if (highlightedSeats.includes(upperSeat)) bgColor = "bg-gray-300";

    return (
      <div
        key={seatNumber}
        onClick={() => handleSeatClick(seatNumber)}
        className={`${bgColor} w-10 h-10 flex items-center justify-center m-1 rounded-md text-white text-sm font-semibold cursor-pointer`}
        title={seatNumber}
      >
        {seatNumber}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {rows.map((row) => (
        <div key={row} className="flex justify-center mb-2">
          {Array.from({ length: columns }, (_, i) => renderSeat(row, i + 1))}
        </div>
      ))}
      <div className="flex justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
