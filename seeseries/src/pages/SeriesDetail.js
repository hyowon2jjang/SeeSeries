// src/pages/SeriesDetail.js
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import SeriesTable from "../components/SeriesTable";
import "./SeriesDetail.css"; // CSS import

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeriesDetail = async () => {
      try {
        const docRef = doc(db, "series", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeries(docSnap.data());
        } else {
          console.warn("No such document!");
        }
      } catch (err) {
        console.error("❌ Firestore fetch error:", err);
      }
    };

    fetchSeriesDetail();
  }, [id]);

  if (!series) return <p className="loading-text">불러오는 중...</p>;

  return (
    <div className="series-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← 돌아가기
      </button>

      <div className="series-detail-content">
        <img
          src={`https://image.tmdb.org/t/p/w400${series.poster_path}`}
          alt={series.title}
          className="series-poster"
        />
        <div className="series-info">
          <h2 className="series-title">{series.title}</h2>
          <p className="series-overview">{series.overview || "설명이 없습니다."}</p>

          <h3 className="season-title">시즌별 평점</h3>
          <SeriesTable seasons={series.seasons || []} />
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
