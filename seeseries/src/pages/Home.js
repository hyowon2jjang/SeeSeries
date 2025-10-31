// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import SeriesCard from "../components/SeriesCard";
import "./Home.css"; // CSS import

const Home = () => {
  const [seriesList, setSeriesList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeries = async () => {
      const querySnapshot = await getDocs(collection(db, "series"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSeriesList(data);
    };
    fetchSeries();
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎬 Series Graph Korea</h1>
        <p>Discover your favorite TV series at a glance</p>
      </header>

      <main className="home-main">
        {seriesList.length === 0 ? (
          <p className="loading-text">불러오는 중...</p>
        ) : (
          <div className="series-grid">
            {seriesList.map((series) => (
              <div
                key={series.id}
                onClick={() => navigate(`/series/${series.id}`)}
                className="series-card-wrapper"
              >
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="home-footer">
        © 2025 Series Graph Korea. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
