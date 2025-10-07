// src/pages/BookingConfirmation.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.event || !state.bookedSeats) {
    return (
      <div className="p-8">
        <p className="text-red-500">No booking details available.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 py-2 px-4 bg-orange-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { event, bookedSeats } = state;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
      <p className="mb-2">Event: {event.title}</p>
      <p className="mb-2">
        Date: {new Date(event.date).toLocaleString()}
      </p>
      <p className="mb-2">Auditorium: {event.auditorium}</p>
      <p className="mb-4">
        Seats Booked: {bookedSeats.join(", ")}
      </p>

      <button
        onClick={() => navigate("/")}
        className="py-2 px-4 bg-orange-600 text-white rounded"
      >
        Back to Events
      </button>
    </div>
  );
}
