const axios = require("axios");

let API_KEY = null;

// 1) 가능한 소스들에서 안전하게 키를 가져옵니다.
try {
  // firebase-functions의 런타임 설정이 있으면 우선 사용
  const functions = require("firebase-functions");
  if (functions && functions.config && functions.config().tmdb && functions.config().tmdb.key) {
    API_KEY = functions.config().tmdb.key;
  }
} catch (e) {
  // firebase-functions가 없거나 로드 실패할 경우 무시
}

try {
  // 로컬 개발을 위해 로컬 config.js가 있으면 사용
  const localConfig = require("./config");
  API_KEY = API_KEY || (localConfig && localConfig.tmdb && localConfig.tmdb.key) || null;
} catch (e) {
  // 로컬 config가 없으면 무시
}

// 환경 변수 폴백
API_KEY = API_KEY || process.env.TMDB_API_KEY || null;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  // axios 인스턴스 생성 시 api_key가 null이면 요청 시 에러가 발생하므로,
  // 호출 시점에 키 유효성을 검사하도록 함
  params: { language: "ko-KR" },
});

// ✅ 함수 이름 fetchPopularSeries
async function fetchPopularSeries() {
  if (!API_KEY) {
    throw new Error("❌ TMDB API key is missing. Set it via firebase functions config or functions/config.js or TMDB_API_KEY env var.");
  }

  const res = await tmdb.get("/tv/popular", {
    params: { api_key: API_KEY },
  });
  console.log("✅ TMDB popular series fetched:", res.data.results.length);
  return res.data.results;
}

module.exports = { fetchPopularSeries };
