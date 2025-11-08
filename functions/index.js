require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const { fetchFullSeriesData } = require("./tmdb");

// ✅ Firebase 초기화
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ✅ TMDB API Key 안전하게 가져오기
let TMDB_API_KEY = null;
try {
  const cfg = functions.config();
  TMDB_API_KEY = cfg?.tmdb?.key;
} catch {
  console.warn("⚠️ functions.config() 접근 실패, 로컬 fallback 사용");
}
if (!TMDB_API_KEY) {
  try {
    const local = require("./config");
    TMDB_API_KEY = local?.tmdb?.key || process.env.TMDB_API_KEY || null;
  } catch {
    TMDB_API_KEY = process.env.TMDB_API_KEY || null;
  }
}

// ✅ TMDB 시리즈 검색 + 전체 정보 저장
exports.searchSeries = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).send("Missing query");

      // 1️⃣ Firestore에서 검색
      const snapshot = await db.collection("series").where("title", "==", query).get();
      if (!snapshot.empty) {
        console.log("✅ Found in Firestore");
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return res.json({ source: "firestore", results: data });
      }

      // 2️⃣ TMDB 검색
      if (!TMDB_API_KEY) return res.status(500).send("TMDB API key missing.");
      console.log(`⚡ Fetching TMDB for query: ${query}`);
      const response = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query, language: "ko-KR" },
      });

      const tmdbResults = (response.data.results || []).slice(0, 3);
      if (tmdbResults.length === 0) return res.status(404).send("No series found.");

      // 3️⃣ 기본 정보 Firestore 저장
      const batch = db.batch();
      tmdbResults.forEach((item) => {
        const ref = db.collection("series").doc(String(item.id));
        batch.set(
          ref,
          {
            title: item.name || item.title,
            overview: item.overview || "",
            poster_path: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "",
            popularity: item.popularity || 0,
            vote_average: item.vote_average || 0,
            first_air_date: item.first_air_date || item.release_date || "",
          },
          { merge: true }
        );
      });
      await batch.commit();

      // 4️⃣ 시즌/에피소드까지 저장
      for (const item of tmdbResults) {
        console.log(`📺 Fetching full data for TMDB ID: ${item.id}`);
        await fetchFullSeriesData(item.id);
      }

      return res.json({ source: "tmdb", results: tmdbResults });
    } catch (error) {
      console.error("❌ searchSeries error:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  });
});
