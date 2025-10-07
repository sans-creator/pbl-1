export const auditoriumLayouts = {
  "TMA PAI": {
    zones: [
      { label: "Front Zone", rows: ["A", "B"] },
      { label: "Middle Zone", rows: ["C", "D"] },
      { label: "Back Zone", rows: ["E"] },
    ],
    rows: [
      { rowLabel: "A", seats: 10 },
      { rowLabel: "B", seats: 10 },
      { rowLabel: "C", seats: 10 },
      { rowLabel: "D", seats: 10 },
      { rowLabel: "E", seats: 10 },
    ],
  },
  "RAMDAS PAI": {
    zones: [
      { label: "Front Zone", rows: ["A"] },
      { label: "Middle Zone", rows: ["B", "C"] },
      { label: "Back Zone", rows: ["D"] },
    ],
    rows: [
      { rowLabel: "A", seats: 8 },
      { rowLabel: "B", seats: 8 },
      { rowLabel: "C", seats: 8 },
      { rowLabel: "D", seats: 8 },
    ],
  },
  "SHARDA PAI": {
    zones: [
      { label: "Front Zone", rows: ["A"] },
      { label: "Middle Zone", rows: ["B"] },
      { label: "Back Zone", rows: ["C"] },
    ],
    rows: [
      { rowLabel: "A", seats: 6 },
      { rowLabel: "B", seats: 6 },
      { rowLabel: "C", seats: 6 },
    ],
  },
};
