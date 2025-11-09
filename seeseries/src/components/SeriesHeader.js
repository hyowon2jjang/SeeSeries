import React from "react";

export default function SeriesHeader({ series }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-10">
      <img
        src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
        alt={series.title}
        className="w-48 h-auto rounded-2xl shadow-md"
      />
      <div>
        <h1 className="text-4xl font-bold mb-2">{series.title}</h1>
        <p className="text-gray-500 mb-2">
          {series.first_air_date?.slice(0, 4)} • 시즌 {series.number_of_seasons} •{" "}
          {series.number_of_episodes}화
        </p>
        <div className="text-yellow-500 font-semibold text-lg">
          ⭐ {series.vote_average?.toFixed(1)}
        </div>
        <p className="mt-3 max-w-2xl text-gray-700">{series.overview}</p>
        <button
          onClick={() => window.print()}
          className="mt-5 px-4 py-2 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700 transition"
        >
          Save as image
        </button>
      </div>
    </div>
  );
}
