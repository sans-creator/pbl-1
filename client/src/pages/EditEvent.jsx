import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [auditorium, setAuditorium] = useState("TMA Pai");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/admin/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(data.title);
        setDescription(data.description);
        setAuditorium(data.auditorium);
        setDate(new Date(data.date).toISOString().slice(0, 16));
        setSeats(data.seats);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch event");
      }
    };
    fetchEvent();
  }, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(
        `/admin/events/${id}`,
        { title, description, auditorium, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Event updated");
      navigate("/admin/events");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={auditorium}
          onChange={(e) => setAuditorium(e.target.value)}
          className="p-2 border rounded"
        >
          <option>TMA Pai</option>
          <option>Ramdas Pai</option>
          <option>Sharda Pai</option>
        </select>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
        >
          Update Event
        </button>
      </form>
    </div>
  );
}
