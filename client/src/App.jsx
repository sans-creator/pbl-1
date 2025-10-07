import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import EventDetails from "./pages/EventDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import ManageEvents from "./pages/ManageEvents";
import CreateEvent from "./pages/CreateEvent";
import ManageAuditoriums from "./pages/ManageAuditoriums";
import Reports from "./pages/Reports";
import AdminLogin from "./pages/AdminLogin";
import EditEvent from "./pages/EditEvent";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/admin/events/edit/:id" element={<EditEvent />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/manage-events" element={<ManageEvents />} />
          <Route path="/admin/create-event" element={<CreateEvent />} />
          <Route path="/admin/manage-auditoriums" element={<ManageAuditoriums />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
