import React from "react";

export default function RatingLegend() {
  const levels = [
    { label: "Awesome", color: "#16a34a" },
    { label: "Great", color: "#22c55e" },
    { label: "Good", color: "#84cc16" },
    { label: "Regular", color: "#eab308" },
    { label: "Bad", color: "#f97316" },
    { label: "Garbage", color: "#ef4444" },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {levels.map((lvl) => (
        <div key={lvl.label} className="flex items-center gap-2 text-sm">
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: lvl.color,
              borderRadius: "4px",
            }}
          ></div>
          <span>{lvl.label}</span>
        </div>
      ))}
    </div>
  );
}
