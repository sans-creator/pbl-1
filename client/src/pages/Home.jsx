import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuditoriumCard from "../components/AuditoriumCard";
import API from "../utils/api";
import universityImage from "../assets/image.png"; // replace with your image
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [auditoriums, setAuditoriums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/events");

        const grouped = data.reduce((acc, event) => {
          if (!acc[event.auditorium]) acc[event.auditorium] = [];
          acc[event.auditorium].push(event);
          return acc;
        }, {});

        const auditoriumArray = Object.keys(grouped).map((name) => ({
          name,
          events: grouped[name].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          ),
        }));

        setAuditoriums(auditoriumArray);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="text-center mt-20 text-lg">Loading events...</p>;
  if (!auditoriums.length) return <p className="text-center mt-20 text-lg">No events available.</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center w-full">
        {/* Hero Section */}
        <section
          className="w-full h-screen bg-cover bg-center flex flex-col justify-center items-center text-center"
          style={{ backgroundImage: `url(${universityImage})` }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white bg-black bg-opacity-50 p-6 rounded">
            Welcome to <span className="text-orange-500">AuditoHub</span>
          </h1>
          <p className="mt-4 text-white text-lg md:text-xl bg-black bg-opacity-40 px-4 py-2 rounded">
            Your gateway to all campus events and auditorium bookings
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 py-3 px-10 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full shadow-lg transition duration-300"
          >
            Go to Dashboard
          </button>
        </section>

        {/* About / Info Section */}
        <section className="mt-20 px-6 md:px-20 text-center max-w-5xl">
          <h2 className="text-3xl font-bold mb-6">Campus Auditoriums</h2>
          <p className="text-gray-700 mb-6">
            Explore our state-of-the-art auditoriums where all university events take place.
            Book your seats for upcoming events and never miss out!
          </p>
        </section>

        {/* Auditorium Cards Section */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-6 md:px-20 w-full">
          {auditoriums.map((aud) => (
            <AuditoriumCard
              key={aud.name}
              name={aud.name}
              events={aud.events}
              onEventClick={(id) => navigate(`/events/${id}`)}
              onViewAll={() => navigate("/dashboard")}
            />
          ))}
        </section>
      </main>

      {/* Sticky Footer */}
      <Footer />
    </div>
  );
};

export default Home;
