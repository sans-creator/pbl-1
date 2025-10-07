// src/pages/EventDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import API from "../utils/api";
import SeatLayout from "../components/SeatLayout";
import Modal from "../components/Modal";


export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictDetails, setConflictDetails] = useState({ invalid: [], already: [] });

  const fetchEventSeats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/events/${id}/seats`);
      setEvent(data);

      const booked = (data.seats || [])
        .filter((s) => s.isBooked)
        .map((s) => s.seatNumber.trim().toUpperCase());
      setOccupiedSeats(booked);
    } catch (err) {
      console.debug('Failed to fetch event data:', err.message || err);
      toast.error("Failed to fetch event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventSeats();
  }, [id]);

  if (loading) return <Loading />;
  if (!event) return <p className="p-8 text-red-500">Event not found.</p>;

  // Derive layout from server-provided seats to avoid mismatches
  // Extract row labels (letters) and compute max columns
  const seatRows = Array.from(
    new Set(
      (event.seats || [])
        .map((s) => (String(s.seatNumber || "").trim().toUpperCase()))
        .map((sn) => {
          const m = sn.match(/^([A-Z]+)(\d+)$/i);
          return m ? m[1] : null;
        })
        .filter(Boolean)
    )
  );

  const maxCols = (event.seats || [])
    .map((s) => {
      const sn = String(s.seatNumber || "").trim().toUpperCase();
      const m = sn.match(/^([A-Z]+)(\d+)$/i);
      return m ? parseInt(m[2], 10) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);

  const config = { rows: seatRows, columns: maxCols };

  const handleBooking = async () => {
    if (!selectedSeats.length) return toast.error("Select at least one seat");
    if (booking) return; // prevent multiple clicks

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");

    // Refresh seats to avoid stale state: fetch latest and re-check
    try {
      const { data: latest } = await API.get(`/events/${id}/seats`);
      const latestOccupied = (latest.seats || []).filter(s => s.isBooked).map(s => s.seatNumber.trim().toUpperCase());
      setOccupiedSeats(latestOccupied);
      const conflict = selectedSeats.map(s => s.trim().toUpperCase()).filter(s => latestOccupied.includes(s));
      if (conflict.length) {
        toast.error(`Seats already booked: ${conflict.join(", ")}`);
        return;
      }
    } catch (e) {
      console.debug('Failed to refresh seats before booking:', e?.message || e);
      // continue — server will still validate
    }

    setBooking(true);
    try {
      // Normalize seats
      const normalizedSeats = selectedSeats.map((s) => s.trim().toUpperCase());

      const { data } = await API.post(`/events/${id}/book`, {
        seats: normalizedSeats,
      });

      // Server now returns partial booking result: { bookedSeats, alreadyBooked, invalidSeats }
      const booked = data.bookedSeats || [];
      const already = data.alreadyBooked || [];
      const invalid = data.invalidSeats || [];

      if (booked.length > 0) {
        toast.success(`Booked: ${booked.join(", ")}`);
        // add newly booked seats to occupied list (normalize)
        setOccupiedSeats(prev => [...prev, ...booked.map(s => s.trim().toUpperCase())]);
        // navigate to confirmation including which seats were booked
        navigate("/booking-confirmation", {
          state: { bookedSeats: booked, event, already, invalid },
        });
        // clear selected seats that were booked
        setSelectedSeats(prev => prev.filter(s => !booked.includes(s.trim().toUpperCase())));
      }

      if ((already.length || invalid.length) && booked.length === 0) {
        // Nothing was booked — show modal with conflicts
        setConflictDetails({ invalid, already });
        setConflictModalOpen(true);
        try { await fetchEventSeats(); } catch (e) { /* ignore */ }
      } else if (already.length || invalid.length) {
        // Partial booking: show modal informing user which seats failed
        setConflictDetails({ invalid, already });
        setConflictModalOpen(true);
        try { await fetchEventSeats(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.debug('Booking error:', err.response?.status, err.response?.data?.message || err.message);
      const resp = err.response?.data;
      if (resp) {
        const already = resp.alreadyBooked || [];
        const invalid = resp.invalidSeats || [];
        if (already.length || invalid.length) {
          // show modal with details and refresh seats automatically
          setConflictDetails({ invalid, already });
          setConflictModalOpen(true);
          try { await fetchEventSeats(); } catch (e) { /* ignore */ }
        } else {
          toast.error(resp.message || "Booking failed");
          fetchEventSeats();
        }
      } else {
        toast.error("Booking failed");
        fetchEventSeats();
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-700 mb-2">{event.description}</p>
      <p className="text-gray-600 mb-6">
        Date: {new Date(event.date).toLocaleString()}
      </p>

      <h2 className="text-xl font-semibold mb-3">
        Select Seats ({event.auditorium})
      </h2>

      <SeatLayout
        rows={config.rows}
        columns={config.columns}
        occupiedSeats={occupiedSeats}
        selectedSeats={selectedSeats}
        highlightedSeats={[...conflictDetails.already, ...conflictDetails.invalid]}
        maxSelection={5}
        onSelect={setSelectedSeats}
      />

      <p className="mt-4 font-medium">
        Selected Seats: {selectedSeats.join(", ") || "None"}
      </p>

      <button
        onClick={handleBooking}
        disabled={booking}
        className={`mt-6 py-2 px-6 rounded text-white ${
          booking
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        {booking ? "Booking..." : "Confirm Booking"}
      </button>

      {/* Conflict modal */}
      <Modal isOpen={conflictModalOpen} onClose={() => {
        // When modal closed remove any selected seats that are invalid/already booked
        setSelectedSeats(prev => prev.filter(s => ![...conflictDetails.already, ...conflictDetails.invalid].includes(s.trim().toUpperCase())));
        setConflictModalOpen(false);
      }}>
        <h3 className="text-lg font-semibold mb-2">Seat conflict</h3>
        {conflictDetails.already.length > 0 && (
          <p className="mb-2">Already booked: {conflictDetails.already.join(", ")}</p>
        )}
        {conflictDetails.invalid.length > 0 && (
          <p className="mb-2">Invalid seats: {conflictDetails.invalid.join(", ")}</p>
        )}
        <p className="text-sm text-gray-600">Seats have been refreshed. Please choose other seats.</p>
        <div className="mt-4 text-right">
          <button
            onClick={() => setConflictModalOpen(false)}
            className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-3 rounded"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
