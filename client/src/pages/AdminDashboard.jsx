import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-6 flex-wrap">
        <Link to="/admin/events" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-500 transition">Manage Events</Link>
        <Link to="/admin/create-event" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-500 transition">Create Event</Link>
        <Link to="/admin/reports" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-500 transition">Reports</Link>
      </div>
    </div>
  );
}
