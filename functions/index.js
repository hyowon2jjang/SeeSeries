const functions = require("firebase-functions");
const admin = require("firebase-admin");

// fetch 폴백: 런타임에 global fetch가 없으면 node-fetch 사용
const fetch = global.fetch || require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

exports.importSeries = functions.https.onRequest(async (req, res) => {
  try {
    console.log("importSeries: start");
    const TMDB_API_KEY = "d20b22731510a315826f8833561ca904";
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=ko-KR&page=1`
    );
    const data = await response.json();

    // Firestore에 저장
    const batch = db.batch();
    data.results.forEach((show) => {
      const ref = db.collection("series").doc(show.id.toString());
      batch.set(ref, {
        id: show.id,
        name: show.name,
        vote_average: show.vote_average,
        poster_path: show.poster_path,
        overview: show.overview,
      });
    });
    await batch.commit();

    console.log(`importSeries: committed ${data.results.length} docs`);
    res.status(200).send(`✅ ${data.results.length} series imported successfully`);
  } catch (error) {
    console.error("importSeries error:", error);
    res.status(500).send("❌ Error importing series");
  }
});
