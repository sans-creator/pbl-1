import { useEffect, useState } from "react";
import API from "../utils/api";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-orange-700">
        Upcoming University Events
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-600">No upcoming events.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-800">{event.title}</h2>
              <p className="text-gray-500 text-sm mb-1">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-gray-600 mb-3">{event.auditorium}</p>
              <p className="text-gray-700 line-clamp-3">{event.description}</p>
              <Link
                to={`/events/${event._id}`}
                className="mt-4 inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
              >
                View Seats
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
