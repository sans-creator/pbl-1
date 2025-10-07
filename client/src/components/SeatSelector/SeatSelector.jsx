import { useState, useEffect } from "react";
import API from "../../utils/api";

export default function SeatSelector({ eventId, onBookingConfirm }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    API.get(`/events/${eventId}/seats`).then(res => setSeats(res.data));
  }, [eventId]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const confirmBooking = async () => {
    await API.post(`/events/${eventId}/book`, { seats: selectedSeats });
    onBookingConfirm(selectedSeats);
    setSelectedSeats([]);
  };

  const rows = [...new Set(seats.map(seat => seat.row))];

  return (
    <div>
      <div className="text-center font-bold mb-2">🎬 Stage</div>
      {rows.map(row => (
        <div key={row} className="flex justify-center space-x-2 mb-2">
          {seats
            .filter(seat => seat.row === row)
            .map(seat => (
              <button
                key={seat.seatNumber}
                className={`w-10 h-10 rounded font-bold text-white
                  ${seat.isBooked ? 'bg-red-600 cursor-not-allowed' :
                  selectedSeats.includes(seat.seatNumber) ? 'bg-blue-600' : 'bg-green-600'}`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.seatNumber}
              </button>
            ))}
        </div>
      ))}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded"
          onClick={confirmBooking}
          disabled={selectedSeats.length === 0}
        >
          Confirm Booking
        </button>
      </div>
      <div className="flex justify-center mt-2 space-x-4">
        <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-green-600"></div><span>Available</span></div>
        <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-red-600"></div><span>Booked</span></div>
        <div className="flex items-center space-x-1"><div className="w-4 h-4 bg-blue-600"></div><span>Selected</span></div>
      </div>
    </div>
  );
}
