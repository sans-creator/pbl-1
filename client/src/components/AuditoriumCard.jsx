import React from "react";

const AuditoriumCard = ({ name, events, onEventClick, onViewAll }) => {
  const totalEvents = events?.length || 0;
  const nextEvent = totalEvents > 0 ? events[0] : null;

  return (
    <div className="group bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[230px]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
          {name}
        </h2>
        <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          {totalEvents} events
        </span>
      </div>

      {nextEvent ? (
        <div className="mt-5 flex flex-col gap-4 flex-grow">
          <button
            onClick={() => onEventClick(nextEvent._id)}
            className="border border-slate-200 bg-white text-slate-700 px-4 py-3 rounded-2xl text-left hover:border-slate-300 hover:bg-slate-50 transition duration-200 text-sm md:text-base flex items-center justify-between gap-4"
          >
            <span className="font-medium truncate">{nextEvent.title}</span>
            <span className="text-xs md:text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
              {new Date(nextEvent.date).toLocaleDateString()}
            </span>
          </button>
          <button
            onClick={onViewAll}
            className="text-sm text-slate-600 hover:text-slate-900 transition"
          >
            View all events
          </button>
        </div>
      ) : (
        <p className="mt-6 text-slate-500">No events scheduled.</p>
      )}
    </div>
  );
};

export default AuditoriumCard;
