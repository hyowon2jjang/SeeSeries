

import React from "react";
import "./../styles/SeriesDetail.css";
import EpisodeGrid from "./../components/EpisodeGrid";



export default function SeriesDetail({ series }) {
  if (!series) return null;

  const imageUrl = series.poster_path
    ? series.poster_path
    : "https://via.placeholder.com/240x360?text=No+Image";

  return (
    <div className="series-detail">

      <div className="series-header">
        <img
          src={`https://image.tmdb.org/t/p/w400${imageUrl}`}
          alt={series.title}
        />
        <div className="series-info">
          <div className="series-title">{series.title}</div>
          <div className="series-meta">
            ⭐ {series.vote_average?.toFixed(1)} · {series.first_air_date}
          </div>
          <div className="series-overview">{series.overview}</div>
        </div>
      </div>

      {/* 시즌/에피소드 표 */}
      <EpisodeGrid seriesId={series.id || series.tmdb_id} />
    </div>
  );
}
