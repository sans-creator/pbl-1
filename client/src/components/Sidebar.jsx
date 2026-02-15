import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Building,
  BarChart2,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Ticket,
} from "lucide-react";

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const studentLinks = useMemo(
    () => [
      { name: "Home", to: "/", icon: <Home size={18} /> },
      { name: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Bookings", to: "/booking-confirmation", icon: <Ticket size={18} /> },
    ],
    []
  );

  const adminLinks = useMemo(
    () => [
      { name: "Admin Home", to: "/admin", icon: <LayoutDashboard size={18} /> },
      { name: "Manage Events", to: "/admin/events", icon: <Calendar size={18} /> },
      { name: "Create Event", to: "/admin/create-event", icon: <PlusCircle size={18} /> },
      { name: "Auditoriums", to: "/admin/manage-auditoriums", icon: <Building size={18} /> },
      { name: "Reports", to: "/admin/reports", icon: <BarChart2 size={18} /> },
      { name: "Public Home", to: "/", icon: <Home size={18} /> },
    ],
    []
  );

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm"
          >
            <Menu size={18} />
            Menu
          </button>
          <div className="text-sm font-semibold text-slate-700">
            {user?.role === "admin" ? "Admin" : "Student"} Panel
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-gradient-to-b from-orange-700 via-orange-600 to-orange-500 text-white shadow-2xl">
            <SidebarContent
              links={links}
              user={user}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full flex-col bg-gradient-to-b from-orange-700 via-orange-600 to-orange-500 text-white shadow-2xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <SidebarContent
          links={links}
          user={user}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}

function SidebarContent({ links, user, collapsed, onClose, onToggleCollapse, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/15">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          {!collapsed && (
            <div>
              <div className="text-lg font-bold tracking-wide">AuditoHub</div>
              <div className="text-xs text-white/80">Auditorium Booking</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex rounded-lg bg-white/15 px-2 py-2 text-white"
            >
              <Menu size={18} />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-6 pt-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/70">Menu</div>
        </div>
      )}

      <nav className={`mt-3 flex-1 ${collapsed ? "px-3" : "px-4"}`}>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl ${
                collapsed ? "px-3 py-3 justify-center" : "px-4 py-3"
              } text-sm font-medium transition ${
                isActive
                  ? "bg-white text-orange-700 shadow"
                  : "text-white/90 hover:bg-white/15"
              }`
            }
          >
            {link.icon}
            {!collapsed && <span>{link.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`pb-6 ${collapsed ? "px-3" : "px-6"}`}>
        {user && !collapsed && (
          <div className="rounded-2xl bg-white/10 px-4 py-4">
            <div className="text-xs text-white/70">Signed in as</div>
            <div className="text-sm font-semibold truncate">{user.name}</div>
          </div>
        )}

        <button
          onClick={onLogout}
          className={`mt-4 rounded-xl bg-white text-orange-700 text-sm font-semibold hover:bg-orange-50 transition ${
            collapsed ? "w-full px-3 py-3" : "w-full px-4 py-3"
          }`}
        >
          <span className={`inline-flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
}
