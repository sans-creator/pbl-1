import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, LayoutDashboard, Calendar, Building, BarChart2, LogOut, Menu, X, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const studentLinks = [
    { name: "Home", to: "/", icon: <Home size={18} /> },
    { name: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
  ];

  const adminLinks = [
    { name: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Events", to: "/admin/events", icon: <Calendar size={18} /> },
    { name: "Auditoriums", to: "/admin/manage-auditoriums", icon: <Building size={18} /> },
    { name: "Reports", to: "/admin/reports", icon: <BarChart2 size={18} /> },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <nav className="bg-orange-400 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={user?.role === "admin" ? "/admin" : "/"} className="flex items-center space-x-2 font-bold text-xl">
            <span className="text-white">🎓</span>
            <span>Auditorium Booking</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user &&
              links.map((link) => (
                <Link key={link.name} to={link.to} className="flex items-center space-x-1 hover:bg-orange-500 px-3 py-1 rounded transition">
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}

            {user && (
              <div className="flex items-center space-x-2 ml-4">
                <span className="font-medium">{user.name}</span>
                <button onClick={handleLogout} className="flex items-center space-x-1 bg-orange-600 hover:bg-red-600 px-3 py-1 rounded transition">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {!user && (
              <Link to="/login" className="flex items-center space-x-1 hover:bg-orange-500 px-3 py-1 rounded transition">
                <LayoutDashboard size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-orange-500 px-2 pt-2 pb-4 space-y-1">
          {user &&
            links.map((link) => (
              <Link key={link.name} to={link.to} className="flex items-center space-x-2 px-2 py-1 hover:bg-orange-400 rounded transition" onClick={() => setMenuOpen(false)}>
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

          {user && (
            <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-2 py-1 bg-orange-600 hover:bg-red-600 rounded transition">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}

          {!user && (
            <Link to="/login" className="flex items-center space-x-2 px-2 py-1 hover:bg-orange-400 rounded transition" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
