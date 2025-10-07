import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <- import navigate
import API from "../utils/api";
import toast from "react-hot-toast";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [auditorium, setAuditorium] = useState("TMA Pai");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // <- initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // backend admin create route is POST /api/admin/events
      const { data } = await API.post("/admin/events", { title, description, date, auditorium });
      if (data) {
        toast.success(data.message || "Event created!");
        // clear form
        setTitle(""); 
        setDescription(""); 
        setDate(""); 
        setAuditorium("TMA Pai");
        // redirect to upcoming events page
        navigate("/admin/events"); // <-- change to the route where upcoming events are displayed
      }
    } catch (err) {
      console.error('Create event failed', err?.response?.data || err.message || err);
      const msg = err?.response?.data?.message || "Failed to create event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-8 max-w-md" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <input 
        type="text" 
        placeholder="Title" 
        className="w-full mb-2 p-2 border" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required
      />
      <textarea 
        placeholder="Description" 
        className="w-full mb-2 p-2 border" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        required
      />
      <input 
        type="datetime-local" 
        className="w-full mb-2 p-2 border" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
        required
      />
      <select 
        className="w-full mb-2 p-2 border" 
        value={auditorium} 
        onChange={(e) => setAuditorium(e.target.value)}
      >
        <option>TMA Pai</option>
        <option>Ramdas Pai</option>
        <option>Sharda Pai</option>
      </select>
      <button 
        type="submit" 
        disabled={loading} 
        className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  );
}
