const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { fetchPopularSeries } = require("./tmdb");

admin.initializeApp();
const db = admin.firestore();

exports.importPopularSeries = functions.https.onRequest(async (req, res) => {
  console.log("🚀 TMDB → Firestore 데이터 가져오기 시작");

  const seriesList = await fetchPopularSeries();

  const batch = db.batch();
  seriesList.forEach((s) => {
    const ref = db.collection("series").doc(String(s.id));
    batch.set(ref, {
      id: s.id,
      name: s.name,
      overview: s.overview,
      poster_path: s.poster_path,
      vote_average: s.vote_average,
      first_air_date: s.first_air_date,
      updatedAt: new Date(),
    });
  });

  await batch.commit();
  console.log(`✅ ${seriesList.length}개의 시리즈가 Firestore에 저장됨`);
  res.send(`저장 완료 (${seriesList.length}개)`);
});
