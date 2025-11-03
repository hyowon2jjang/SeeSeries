// functions/tmdb.js

const axios = require("axios");
const admin = require("firebase-admin");

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";


/**
 * TMDB API에서 시리즈 데이터를 가져오는 함수
 * @param {string} tmdbId - 검색어
 * @return {Promise<Object[]>} 시리즈 데이터 배열
 */
async function fetchFullSeriesData(tmdbId) {
  try {
    // 1️⃣ 기본 시리즈 정보
    const {data: series} = await axios.get(`${TMDB_BASE}/tv/${tmdbId}`, {
      params: {api_key: TMDB_API_KEY, language: "ko-KR"},
    });

    const seriesRef = db.collection("series").doc(String(tmdbId));

    // 2️⃣ Firestore에 기본 정보 저장
    await seriesRef.set(
        {tmdb_id: tmdbId,
          title: series.name,
          original_name: series.original_name,
          poster_path: series.poster_path,
          overview: series.overview,
          popularity: series.popularity,
          vote_average: series.vote_average,
          first_air_date: series.first_air_date,
          number_of_seasons: series.number_of_seasons,
          number_of_episodes: series.number_of_episodes,
          last_updated: new Date(),
        },
        {merge: true},
    );

    // 3️⃣ 시즌 정보 가져오기
    for (const season of series.seasons) {
      const seasonRef =
        seriesRef.collection("seasons").doc(String(season.season_number));
      await seasonRef.set({
        name: season.name,
        air_date: season.air_date,
        season_number: season.season_number,
        episode_count: season.episode_count,
      });

      // 4️⃣ 에피소드 정보 가져오기
      const {data: seasonDetail} = await axios.get(
          `${TMDB_BASE}/tv/${tmdbId}/season/${season.season_number}`,
          {params: {api_key: TMDB_API_KEY, language: "ko-KR"}},
      );

      for (const ep of seasonDetail.episodes) {
        await seasonRef.collection("episodes").
            doc(String(ep.episode_number)).set({
              name: ep.name,
              overview: ep.overview,
              air_date: ep.air_date,
              episode_number: ep.episode_number,
              vote_average: ep.vote_average,
            });
      }
    }

    return {success: true};
  } catch (err) {
    console.error("❌ fetchFullSeriesData error:", err.message);
    return {success: false, error: err.message};
  }
}

module.exports = {fetchFullSeriesData};
