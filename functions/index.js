// ✅ 항상 가장 위에 있어야 함
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({origin: true});

// ✅ Firebase 초기화
admin.initializeApp();
const db = admin.firestore();

// ✅ TMDB API Key 안전하게 가져오기
let TMDB_API_KEY = null;
try {
  const cfg = functions.config();
  TMDB_API_KEY = cfg && cfg.tmdb && cfg.tmdb.key;
} catch (e) {
  console.warn("⚠️ functions.config() 접근 실패, 로컬 fallback 사용");
}

if (!TMDB_API_KEY) {
  try {
    const local = require("./config");
    TMDB_API_KEY =
      local && local.tmdb && local.tmdb.key?
        local.tmdb.key:
        process.env.TMDB_API_KEY || null;
  } catch (e) {
    TMDB_API_KEY = process.env.TMDB_API_KEY || null;
  }
}

// ✅ TMDB 시리즈 검색 함수
exports.searchSeries = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {query} = req.query;
      if (!query) return res.status(400).send("Missing query");

      // 🔍 1. Firestore에서 먼저 검색
      const snapshot = await db
          .collection("series")
          .where("title", "==", query)
          .get();

      if (!snapshot.empty) {
        console.log("✅ Found in Firestore");
        const data = snapshot.docs.map((doc) =>
          ({id: doc.id, ...doc.data()}));
        return res.json({source: "firestore", results: data});
      }

      // 🔑 TMDB 키 확인
      if (!TMDB_API_KEY) {
        console.error("❌ TMDB API key is missing.");
        return res
            .status(500)
            .send(
                "TMDB API key is missing.",
            );
      }

      // ⚡ 2. TMDB API 호출
      console.log("⚡ Fetching from TMDB...");
      const response = await axios.get(
          "https://api.themoviedb.org/3/search/tv",
          {
            params: {api_key: TMDB_API_KEY, query, language: "ko-KR"},
          },
      );

      const tmdbResults = (response.data.results || []).slice(0, 5);
      const formatted = tmdbResults.map((item) => ({
        title: item.name || item.title,
        overview: item.overview || "",
        poster_path: item.poster_path ?
          `https://image.tmdb.org/t/p/w500${item.poster_path}` :
          "",
        popularity: item.popularity || 0,
        vote_average: item.vote_average || 0,
        id: String(item.id),
        first_air_date: item.first_air_date || item.release_date || "",
      }));

      // 🧩 Firestore에 저장
      const batch = db.batch();
      formatted.forEach((series) => {
        const ref = db.collection("series").doc(series.id);
        batch.set(ref, series, {merge: true});
      });
      await batch.commit();

      return res.json({source: "tmdb", results: formatted});
    } catch (error) {
      console.error("❌ Error:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
});
