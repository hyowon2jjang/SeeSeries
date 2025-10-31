// src/components/SeriesTable.js
import React from "react";
import "./SeriesTable.css";

const SeriesTable = ({ seasons }) => {
  return (
    <table className="series-table">
      <thead>
        <tr>
          <th>시즌</th>
          <th>에피소드</th>
          <th>평점</th>
        </tr>
      </thead>
      <tbody>
        {seasons.map((season, idx) => (
          <tr key={idx}>
            <td>{season.title}</td>
            <td>{season.episode_count}</td>
            <td>{season.vote_average.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SeriesTable;
