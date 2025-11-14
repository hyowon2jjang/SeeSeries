import React, { useEffect, useState } from "react";
import "../styles/EpisodeGrid.css";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * props: { seriesId }
 */
export default function EpisodeGrid({ seriesId }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    const fetchSeasons = async () => {
      try {
        // 🔹 시즌 데이터 가져오기
        const seasonsRef = collection(db, "series", String(seriesId), "seasons");
        const seasonsQuery = query(seasonsRef, orderBy("season_number"));
        const seasonsSnap = await getDocs(seasonsQuery);

        const seasonData = [];

        for (const seasonDoc of seasonsSnap.docs) {
          const season = seasonDoc.data();

          // 🔹 해당 시즌의 에피소드 데이터 가져오기
          const episodesRef = collection(
            db,
            "series",
            String(seriesId),
            "seasons",
            String(season.season_number),
            "episodes"
          );
          const episodesQuery = query(episodesRef, orderBy("episode_number"));
          const episodesSnap = await getDocs(episodesQuery);

          const episodes = episodesSnap.docs.map((ep) => ep.data());
          seasonData.push({ ...season, episodes });
        }

        setSeasons(seasonData);
      } catch (err) {
        console.error("🔥 Failed to load season data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [seriesId]);

  if (loading) return <div style={{ color: "#ccc" }}>로딩 중...</div>;

  // 평점 색상 클래스
  const getRatingClass = (score) => {
    if (score >= 9) return "rating-awesome";
    if (score >= 8) return "rating-great";
    if (score >= 7) return "rating-good";
    if (score >= 6) return "rating-regular";
    if (score > 0) return "rating-bad";
    return "rating-na";
  };

  return (
    <div className="episode-grid">
      {seasons.map((season) => (
        <div key={season.season_number} className="season-block">
          <div className="season-title">Season {season.season_number}</div>

          <div
            className="episode-table"
            style={{
              gridTemplateColumns: `repeat(${season.episodes.length}, 50px)`
,
            }}
          >
            {season.episodes.map((ep) => (
              <div
                key={ep.episode_number}
                className={`episode-cell ${getRatingClass(ep.vote_average)}`}
                title={`${ep.name} (Ep ${ep.episode_number}) - ${ep.vote_average}`}
              >
                {ep.vote_average ? ep.vote_average.toFixed(1) : "–"}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
