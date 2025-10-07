import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-6">
        <Link to="/admin/manage-events" className="bg-orange-600 text-white px-4 py-2 rounded">
          Manage Events
        </Link>
        <Link to="/admin/create-event" className="bg-orange-600 text-white px-4 py-2 rounded">
          Create Event
        </Link>
        <Link to="/admin/reports" className="bg-orange-600 text-white px-4 py-2 rounded">
          Reports
        </Link>
      </div>
    </div>
  );
}
