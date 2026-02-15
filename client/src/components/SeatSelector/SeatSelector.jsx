import { useState, useEffect, useRef } from "react";
import API from "../../utils/api";
import "./SeatSelector.css";

export default function SeatSelector({ eventId, onBookingConfirm }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [lastRemoved, setLastRemoved] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => {
    API.get(`/events/${eventId}/seats`).then(res => setSeats(res.data));
  }, [eventId]);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const handleSeatToggle = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat.seatNumber)) {
      const remaining = selectedSeats.filter(s => s !== seat.seatNumber);
      setSelectedSeats(remaining);
      setLastRemoved(seat.seatNumber);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setLastRemoved(null), 5000);
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const handleKeyDown = (e, seat) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSeatToggle(seat);
    }
  };

  const confirmBooking = async () => {
    await API.post(`/events/${eventId}/book`, { seats: selectedSeats });
    onBookingConfirm(selectedSeats);
    setSelectedSeats([]);
  };

  const undoLast = () => {
    if (!lastRemoved) return;
    setSelectedSeats([...selectedSeats, lastRemoved]);
    setLastRemoved(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const rows = [...new Set(seats.map(seat => seat.row))];

  const selectedSeatObjs = selectedSeats.map(sn => seats.find(s => s.seatNumber === sn)).filter(Boolean);
  const totalPrice = selectedSeatObjs.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <div>
      <div className="text-center font-bold mb-2">🎬 Stage</div>
      {rows.map(row => (
        <div key={row} className="flex justify-center space-x-2 mb-2" role="group" aria-label={`Row ${row}`}>
          {seats
            .filter(seat => seat.row === row)
            .map(seat => (
              <button
                key={seat.seatNumber}
                className={`w-10 h-10 rounded font-bold text-white flex items-center justify-center focus:outline-2
                  ${seat.isBooked ? 'bg-red-600 cursor-not-allowed' :
                  selectedSeats.includes(seat.seatNumber) ? 'bg-blue-600' : 'bg-green-600'}`}
                onClick={() => handleSeatToggle(seat)}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
                onFocus={() => setHoveredSeat(seat)}
                onBlur={() => setHoveredSeat(null)}
                onKeyDown={(e) => handleKeyDown(e, seat)}
                aria-pressed={selectedSeats.includes(seat.seatNumber)}
                aria-label={`Seat ${seat.seatNumber} row ${seat.row} ${seat.isBooked ? 'booked' : 'available'}`}
                disabled={seat.isBooked}
              >
                <span>{seat.seatNumber}</span>
              </button>
            ))}
        </div>
      ))}

      <div className="mt-4 flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
            onClick={confirmBooking}
            disabled={selectedSeats.length === 0}
          >
            Confirm Booking
          </button>
          <div className="text-sm text-gray-700">{selectedSeats.length} selected</div>
        </div>

        <div className="w-full max-w-md bg-white/60 backdrop-blur-sm rounded p-3 shadow-sm">
          <div className="text-sm font-medium mb-1">Selection summary</div>
          {selectedSeats.length === 0 ? (
            <div className="text-xs text-gray-600">No seats selected</div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm">{selectedSeats.join(', ')}</div>
              <div className="text-sm font-semibold">${totalPrice.toFixed(2)}</div>
            </div>
          )}
          {lastRemoved && (
            <div className="mt-2 text-sm text-yellow-800 flex items-center justify-between">
              <div>Removed {lastRemoved}</div>
              <button className="underline" onClick={undoLast}>Undo</button>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-2 space-x-4">
          <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-green-600"></div><span>Available</span></div>
          <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-red-600"></div><span>Booked</span></div>
          <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-blue-600"></div><span>Selected</span></div>
        </div>

        <div className="mt-2 w-full max-w-md">
          <div className="text-xs text-gray-600">{hoveredSeat ? (
            <span>Seat {hoveredSeat.seatNumber} — Row {hoveredSeat.row} {hoveredSeat.price ? `— $${hoveredSeat.price}` : ''} {hoveredSeat.isAccessible ? '— Accessible' : ''}</span>
          ) : (
            <span>Hover or focus a seat to see details</span>
          )}</div>
        </div>
      </div>
    </div>
  );
}
