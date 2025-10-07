import { useEffect, useState } from "react";
import API from "../utils/api";

export default function Reports() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("/bookings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Booking Reports</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">User</th>
            <th className="p-2">Event</th>
            <th className="p-2">Auditorium</th>
            <th className="p-2">Seat</th>
            <th className="p-2">Booked At</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id} className="border-b">
              <td className="p-2">{b.user?.name}</td>
              <td className="p-2">{b.event?.title}</td>
              <td className="p-2">{b.event?.auditorium}</td>
              <td className="p-2">{b.seatNumber}</td>
              <td className="p-2">{new Date(b.bookedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
