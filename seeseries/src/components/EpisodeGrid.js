import React, { useEffect, useState } from "react";
import "../styles/EpisodeGrid.css";
import { db } from "../services/firebase"; // Firestore 연결된 경우

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
        const seasonsSnap = await db
          .collection("series")
          .doc(seriesId)
          .collection("seasons")
          .orderBy("season_number")
          .get();

        const seasonData = [];

        for (const seasonDoc of seasonsSnap.docs) {
          const season = seasonDoc.data();
          const episodesSnap = await db
            .collection("series")
            .doc(seriesId)
            .collection("seasons")
            .doc(String(season.season_number))
            .collection("episodes")
            .orderBy("episode_number")
            .get();

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

  // 평점에 따라 색상 클래스 선택
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
        <div key={season.season_number}>
          <div className="season-title">Season {season.season_number}</div>

          <div
            className="episode-table"
            style={{
              gridTemplateColumns: `repeat(${season.episodes.length}, 50px)`,
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
