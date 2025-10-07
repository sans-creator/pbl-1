import { useEffect, useState } from "react";
import API from "../utils/api";

export default function ManageAuditoriums() {
  const [auditoriums, setAuditoriums] = useState([]);
  const [name, setName] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  useEffect(() => {
    API.get("/auditoriums").then(res => setAuditoriums(res.data));
  }, []);

  const handleAdd = async () => {
    await API.post("/auditoriums", { name, totalSeats });
    setAuditoriums([...auditoriums, { name, totalSeats }]);
    setName(""); setTotalSeats("");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Auditoriums</h1>
      <div className="mb-4 flex space-x-2">
        <input placeholder="Name" className="p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Total Seats" className="p-2 border rounded" value={totalSeats} onChange={e=>setTotalSeats(e.target.value)} />
        <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add</button>
      </div>
      <div>
        {auditoriums.map(a => (
          <div key={a._id || a.name} className="p-2 bg-white shadow rounded mb-2">{a.name} - {a.totalSeats} Seats</div>
        ))}
      </div>
    </div>
  );
}
