import React from "react";

const AuditoriumCard = ({ name, events, onEventClick }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-md transition-shadow duration-300 flex flex-col">
      
      {/* Auditorium Name */}
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
        {name}
      </h2>

      {/* Events List */}
      {events && events.length > 0 ? (
        <div className="flex flex-col gap-3 flex-grow">
          {events.map((event) => (
            <button
              key={event._id}
              onClick={() => onEventClick(event._id)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-left hover:bg-gray-100 transition duration-200 text-sm md:text-base"
            >
              {event.title} - {new Date(event.date).toLocaleDateString()}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No events scheduled.</p>
      )}
    </div>
  );
};

export default AuditoriumCard;
