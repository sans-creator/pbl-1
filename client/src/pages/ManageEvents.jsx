import { useEffect, useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch events");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Events</h1>
      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white p-4 rounded shadow flex flex-col"
            >
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600">{new Date(event.date).toLocaleString()}</p>
              <p className="text-gray-700 mt-2">{event.description}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
