import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import EventDetails from "./pages/EventDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import ManageEvents from "./pages/ManageEvents";
import CreateEvent from "./pages/CreateEvent";
import ManageAuditoriums from "./pages/ManageAuditoriums";
import Reports from "./pages/Reports";
import EditEvent from "./pages/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute";

function AppWrapper() {
  const location = useLocation();
  const hideShellPaths = ["/login", "/admin/login"];
  const showShell = !hideShellPaths.includes(location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {showShell && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      )}
      <main className={showShell ? (sidebarCollapsed ? "lg:pl-20" : "lg:pl-72") : ""}>
        <div className={showShell ? "px-4 lg:px-8 py-6" : ""}>
          <div key={location.pathname} className="page-transition">
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute><ManageEvents /></ProtectedRoute>} />
            <Route path="/admin/events/edit/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
            <Route path="/admin/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/admin/manage-auditoriums" element={<ProtectedRoute><ManageAuditoriums /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;
