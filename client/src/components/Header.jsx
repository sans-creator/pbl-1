import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-orange-600 text-white p-4 flex justify-between">
      <h1 className="font-bold">Auditorium Booking</h1>
      {user && (
        <div className="flex space-x-4 items-center">
          <span>{user.name}</span>
          <button onClick={handleLogout} className="bg-red-500 px-2 py-1 rounded">Logout</button>
        </div>
      )}
    </header>
  );
}
