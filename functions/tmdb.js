const axios = require("axios");
const config = require("./config");

const API_KEY = (config && config.tmdb && config.tmdb.key) || null;

if (!API_KEY) {
  throw new Error("❌ TMDB API key is missing. Check functions/config.js");
}

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {api_key: API_KEY, language: "ko-KR"},
});

// ✅ 함수 이름 fetchPopularSeries
async function fetchPopularSeries() {
  const res = await tmdb.get("/tv/popular");
  console.log("✅ TMDB popular series fetched:", res.data.results.length);
  return res.data.results;
}

module.exports = {fetchPopularSeries};
