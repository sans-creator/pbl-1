import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";

// Color scheme
const SEAT_COLORS = {
  available: "bg-green-500 hover:bg-green-600",
  booked: "bg-red-500 opacity-70 cursor-not-allowed",
  selected: "bg-orange-500",
};

export default function AdminSeatLayout() {
  const { id } = useParams(); // event id
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch event with seats
  const fetchEvent = async () => {
    try {
      const { data } = await API.get(`/admin/event/${id}`);
      setEvent(data);
    } catch (err) {
      toast.error("Failed to fetch event data");
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (!event) return <p className="p-8">Loading...</p>;

  // Toggle seat manually
  const toggleSeat = (seat) => {
    if (seat.isBooked) return; // booked seats cannot be unbooked
    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((s) => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  // Save changes
  const handleUpdateSeats = async () => {
    try {
      const { data } = await API.put(`/admin/event/${id}`, {
        updatedSeats: selectedSeats,
      });
      if (data.success) {
        toast.success("Seats updated successfully!");
        setSelectedSeats([]);
        fetchEvent(); // refresh
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{event.title} - Seats</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {event.seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.seatNumber);
          const seatClass = seat.isBooked
            ? SEAT_COLORS.booked
            : isSelected
            ? SEAT_COLORS.selected
            : SEAT_COLORS.available;

          return (
            <button
              key={seat.seatNumber}
              className={`w-12 h-12 rounded text-white font-bold transition ${seatClass}`}
              onClick={() => toggleSeat(seat)}
              title={seat.seatNumber}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleUpdateSeats}
        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
