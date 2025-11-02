// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import SeriesCard from "../components/SeriesCard";
import "./Home.css";

const Home = () => {
  const [popularSeries, setPopularSeries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Firestore에서 인기 시리즈 10개 불러오기
  useEffect(() => {
    const fetchPopular = async () => {
      const q = query(collection(db, "series"), orderBy("popularity", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPopularSeries(data);
    };
    fetchPopular();
  }, []);

  // ✅ 전체 시리즈 미리 로드 (검색용)
  useEffect(() => {
    const fetchAll = async () => {
      const snapshot = await getDocs(collection(db, "series"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllSeries(data);
    };
    fetchAll();
  }, []);

  // ✅ 검색어 입력 시 Firestore → TMDB 순서로 검색
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      const queryLower = searchQuery.toLowerCase();

      // 1️⃣ Firestore에서 검색
      const filtered = allSeries.filter((series) => {
    const t = String(series?.title || series?.name || "").toLowerCase();
    return t.includes(queryLower);
  });

      if (filtered.length > 0) {
        setSearchResults(filtered);
        setIsLoading(false);
        return;
      }

      // 2️⃣ TMDB Cloud Function 호출 (없을 경우 자동 추가)
      try {
  const res = await fetch(
    `https://us-central1-seeseries-66a16.cloudfunctions.net/searchSeries?query=${encodeURIComponent(
      searchQuery
    )}`
  );

  if (!res.ok) throw new Error("TMDB function error");
  const data = await res.json();

  // ✅ Firestore 새 데이터 다시 가져오기
  const updatedSnapshot = await getDocs(collection(db, "series"));
  const updatedData = updatedSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // ✅ Firestore에서 새로 추가된 시리즈 중 검색어 포함된 것만 필터링
  const queryLower = searchQuery.toLowerCase();
  const matched = updatedData.filter((series) =>
    String(series?.title || "").toLowerCase().includes(queryLower)
  );

  // ✅ 최신 데이터 반영
  setAllSeries(updatedData);
  setSearchResults(matched);
} catch (err) {
  console.error("❌ TMDB search error:", err);
} finally {
  setIsLoading(false);
}
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎬 Series Graph Korea</h1>
        <p>Discover trending series and find your favorites</p>

        {/* 🔍 검색창 */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="시리즈 제목을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="home-main">
        {/* 🔍 검색 결과 섹션 */}
        {searchQuery && (
          <section className="search-section">
            <h2>🔎 검색 결과</h2>
            {isLoading ? (
              <p className="loading-text">검색 중입니다...</p>
            ) : searchResults.length === 0 ? (
              <p className="loading-text">검색 결과가 없습니다 😢</p>
            ) : (
              <div className="series-grid">
                {searchResults.map((series) => (
                  <div
                    key={series.id || series.tmdb_id}
                    onClick={() => navigate(`/series/${series.id || series.tmdb_id}`)}
                    className="series-card-wrapper"
                  >
                    <SeriesCard series={series} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* 🌟 인기 시리즈 섹션 */}
        <section className="popular-section">
          <h2>🔥 지금 인기 있는 시리즈</h2>
          <div className="series-grid">
            {popularSeries.map((series) => (
              <div
                key={series.id}
                onClick={() => navigate(`/series/${series.id}`)}
                className="series-card-wrapper"
              >
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        </section>

        
      </main>

      <footer className="home-footer">
        © 2025 Series Graph Korea. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
