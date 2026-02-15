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
  if (!event) return <p className="p-8 text-red-500 text-center text-lg">Event not found.</p>;

  const seatRows = Array.from(
    new Set(
      (event.seats || [])
        .map((s) => String(s.seatNumber || "").trim().toUpperCase())
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

  const rowStats = seatRows.map((row) => {
    const rowSeats = (event.seats || [])
      .map((s) => String(s.seatNumber || "").trim().toUpperCase())
      .filter((sn) => sn.startsWith(row));
    const booked = rowSeats.filter((sn) => occupiedSeats.includes(sn));
    const total = rowSeats.length;
    const ratio = total ? booked.length / total : 0;
    return { row, total, booked: booked.length, ratio };
  });

  const handleBooking = async () => {
    if (!selectedSeats.length) return toast.error("Select at least one seat");
    if (booking) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");

    try {
      const { data: latest } = await API.get(`/events/${id}/seats`);
      const latestOccupied = (latest.seats || [])
        .filter(s => s.isBooked)
        .map(s => s.seatNumber.trim().toUpperCase());

      setOccupiedSeats(latestOccupied);
      const conflict = selectedSeats.map(s => s.trim().toUpperCase()).filter(s => latestOccupied.includes(s));
      if (conflict.length) {
        toast.error(`Seats already booked: ${conflict.join(", ")}`);
        return;
      }
    } catch (e) {
      console.debug('Failed to refresh seats before booking:', e?.message || e);
    }

    setBooking(true);
    try {
      const normalizedSeats = selectedSeats.map(s => s.trim().toUpperCase());
      const { data } = await API.post(`/events/${id}/book`, { seats: normalizedSeats });

      const booked = data.bookedSeats || [];
      const already = data.alreadyBooked || [];
      const invalid = data.invalidSeats || [];

      if (booked.length > 0) {
        toast.success(`Booked: ${booked.join(", ")}`);
        setOccupiedSeats(prev => [...prev, ...booked.map(s => s.trim().toUpperCase())]);
        navigate("/booking-confirmation", {
          state: { bookedSeats: booked, event, already, invalid },
        });
        setSelectedSeats(prev => prev.filter(s => !booked.includes(s.trim().toUpperCase())));
      }

      if ((already.length || invalid.length) && booked.length === 0) {
        setConflictDetails({ invalid, already });
        setConflictModalOpen(true);
        await fetchEventSeats();
      } else if (already.length || invalid.length) {
        setConflictDetails({ invalid, already });
        setConflictModalOpen(true);
        await fetchEventSeats();
      }
    } catch (err) {
      console.debug('Booking error:', err.response?.status, err.response?.data?.message || err.message);
      const resp = err.response?.data;
      if (resp) {
        const already = resp.alreadyBooked || [];
        const invalid = resp.invalidSeats || [];
        if (already.length || invalid.length) {
          setConflictDetails({ invalid, already });
          setConflictModalOpen(true);
          await fetchEventSeats();
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
    <div className="max-w-5xl mx-auto p-8">
      {/* Event Info Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 border-l-4 border-orange-500">
        <h1 className="text-2xl font-semibold mb-3 text-gray-800">{event.title}</h1>
        <p className="text-gray-700 mb-2">{event.description}</p>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleString()}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Auditorium:</span> {event.auditorium}
        </p>
      </div>

      {/* Seat Availability Heatmap */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Seat Availability</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex h-2 w-6 rounded-full bg-green-500" />
            Low
            <span className="inline-flex h-2 w-6 rounded-full bg-yellow-400" />
            Medium
            <span className="inline-flex h-2 w-6 rounded-full bg-red-500" />
            High
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rowStats.map((row) => {
            const fillClass =
              row.ratio >= 0.7 ? "bg-red-500" : row.ratio >= 0.4 ? "bg-yellow-400" : "bg-green-500";
            return (
              <div key={row.row} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span className="font-semibold">Row {row.row}</span>
                  <span>
                    {row.booked}/{row.total} booked
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${fillClass}`}
                    style={{ width: `${Math.round(row.ratio * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Select Seats</h2>
        <SeatLayout
          rows={config.rows}
          columns={config.columns}
          occupiedSeats={occupiedSeats}
          selectedSeats={selectedSeats}
          highlightedSeats={[...conflictDetails.already, ...conflictDetails.invalid]}
          maxSelection={5}
          onSelect={setSelectedSeats}
        />
        <p className="mt-4 font-medium text-gray-700">
          Selected Seats: {selectedSeats.join(", ") || "None"}
        </p>
      </div>

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={booking}
        className={`mt-4 py-3 px-8 rounded-lg text-white font-semibold shadow-md
          ${booking ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}
        `}
      >
        {booking ? "Booking..." : "Confirm Booking"}
      </button>

      {/* Conflict Modal */}
      <Modal isOpen={conflictModalOpen} onClose={() => {
        setSelectedSeats(prev => prev.filter(s => ![...conflictDetails.already, ...conflictDetails.invalid].includes(s.trim().toUpperCase())));
        setConflictModalOpen(false);
      }}>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Seat Conflict</h3>
        {conflictDetails.already.length > 0 && (
          <p className="mb-2">Already booked: <span className="text-gray-600 font-semibold">{conflictDetails.already.join(", ")}</span></p>
        )}
        {conflictDetails.invalid.length > 0 && (
          <p className="mb-2">Invalid seats: <span className="text-yellow-600 font-semibold">{conflictDetails.invalid.join(", ")}</span></p>
        )}
        <p className="text-sm text-gray-600">Seats have been refreshed. Please choose other seats.</p>
        <div className="mt-4 text-right">
          <button
            onClick={() => setConflictModalOpen(false)}
            className="bg-gray-700 hover:bg-gray-800 text-white py-1 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
