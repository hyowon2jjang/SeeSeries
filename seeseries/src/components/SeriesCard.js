// src/components/SeriesCard.js
import React from "react";
import "./SeriesCard.css";

const SeriesCard = ({ series }) => {
  const imageUrl = series.poster_url
    ? series.poster_url
    : "https://via.placeholder.com/240x360?text=No+Image";

  return (
    <div className="series-card">
  <div className="series-card-image-wrapper">
    <img src={imageUrl} alt={series.title} className="series-card-image" />
  </div>
  <div className="series-card-title">
    <p>{series.title}</p>
  </div>
</div>
  );
};

export default SeriesCard;
