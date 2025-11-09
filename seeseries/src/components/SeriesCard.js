// src/components/SeriesCard.js
import React from "react";
import "./../styles/SeriesCard.css";

const SeriesCard = ({ series }) => {
  const imageUrl = series.poster_path
    ? series.poster_path
    : "https://via.placeholder.com/240x360?text=No+Image";

  return (
    <div className="series-card">
  <div className="series-card-image-wrapper">
    <img src={`https://image.tmdb.org/t/p/w400${
imageUrl
    }`} alt={series.title || series.name} className="series-card-image" />
  </div>
  <div className="series-card-title">
    <h3>{series.title || series.name}</h3>
  </div>
</div>
  );
};

export default SeriesCard;
