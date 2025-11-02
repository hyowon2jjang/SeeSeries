const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const TMDB_API_KEY = functions.config().tmdb.key;
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6시간 캐시

exports.fetchPopularSeries = functions.https.onRequest(async (req, res) => {
  try {
    const cacheDoc = db.collection("cache").doc("popular_series");
    const cacheSnap = await cacheDoc.get();

    const now = Date.now();

    // ✅ 1️⃣ 캐시가 존재하고 유효한 경우
    if (cacheSnap.exists) {
      const data = cacheSnap.data();
      const isFresh = now - data.timestamp < CACHE_DURATION;

      if (isFresh) {
        console.log("🟢 캐시된 데이터 사용");
        return res.json({ source: "cache", results: data.results });
      }
    }

    // ⚙️ 2️⃣ TMDB에서 새로 불러오기
    console.log("🔄 TMDB API에서 새 데이터 가져오는 중...");
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=1`
    );

    const results = response.data.results.map((show) => ({
      id: show.id,
      title: show.name,
      poster_path: show.poster_path,
      overview: show.overview,
      vote_average: show.vote_average,
    }));

    // 🧱 3️⃣ Firestore에 캐시 저장
    await cacheDoc.set({
      results,
      timestamp: now,
    });

    res.json({ source: "tmdb", results });
  } catch (error) {
    console.error("❌ 캐시 로직 실패:", error);
    res.status(500).json({ error: error.message });
  }
});
