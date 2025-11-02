// functions/index.js

const cors = require("cors")({ origin: true });

exports.searchSeries = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 기존 코드 내부 전체 여기에 들어가면 됩니다.
  });
});


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// 안전하게 TMDB 키 가져오기 — 모듈 로드 시점에 예외를 던지지 않음
let TMDB_API_KEY = null;
try {
  const cfg = functions.config();
  TMDB_API_KEY = cfg && cfg.tmdb && cfg.tmdb.key;
} catch (e) {
  // functions.config() 호출이 분석/로딩 단계에서 실패할 수 있으므로 무시
}
TMDB_API_KEY =
  TMDB_API_KEY ||
  process.env.TMDB_API_KEY ||
  (() => {
    try {
      const local = require("./config");
      return local && local.tmdb && local.tmdb.key;
    } catch {
      return null;
    }
  })();

// ✅ TMDB 시리즈 검색 함수
exports.searchSeries = functions.https.onRequest(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).send("Missing query");

    // Firestore에서 먼저 검색
    const snapshot = await db
      .collection("series")
      .where("title", "==", query)
      .get();

    if (!snapshot.empty) {
      console.log("✅ Found in Firestore");
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json({ source: "firestore", results: data });
    }

    // TMDB 키가 없으면 명확한 에러 반환
    if (!TMDB_API_KEY) {
      console.error("❌ TMDB API key is missing.");
      return res.status(500).send("TMDB API key is missing. Set it via firebase functions config, env var, or functions/config.js");
    }

    // Firestore에 없으면 TMDB API 호출
    console.log("⚡ Fetching from TMDB...");
    const response = await axios.get("https://api.themoviedb.org/3/search/tv", {
      params: { api_key: TMDB_API_KEY, query, language: "ko-KR" },
    });

    const tmdbResults = (response.data.results || []).slice(0, 5);
    const formatted = tmdbResults.map((item) => ({
      title: item.title || item.name,
      overview: item.overview || "",
      poster_path: item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "",
      popularity: item.popularity || 0,
      vote_average: item.vote_average || 0,
      id: String(item.id),
      first_air_date: item.first_air_date || item.release_date || "",
    }));

    // Firestore에 저장
    const batch = db.batch();
    formatted.forEach((series) => {
      const ref = db.collection("series").doc(series.id);
      batch.set(ref, series, { merge: true });
    });
    await batch.commit();

    res.json({ source: "tmdb", results: formatted });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
