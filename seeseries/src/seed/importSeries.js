import { db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { getSeries, getSeason } from "../services/tmdb";

export async function importSeries(tmdbId) {
  const series = await getSeries(tmdbId);

  const seriesRef = doc(db, "series", String(series.id));
  await setDoc(seriesRef, {
    title: series.name,
    poster_url: `https://image.tmdb.org/t/p/w500${series.poster_path}`,
    vote_average: series.vote_average,
  });

  for (const season of series.seasons) {
    const seasonData = await getSeason(series.id, season.season_number);
    const seasonRef = doc(collection(seriesRef, "seasons"), String(season.season_number));

    await setDoc(seasonRef, {
      season_name: seasonData.name,
      season_poster: `https://image.tmdb.org/t/p/w500${seasonData.poster_path}`,
    });

    for (const ep of seasonData.episodes) {
      const epRef = doc(collection(seasonRef, "episodes"), String(ep.episode_number));
      await setDoc(epRef, {
        episode_name: ep.name,
        vote_average: ep.vote_average,
        air_date: ep.air_date,
      });
    }
  }

  console.log("✅ Data Import Completed");
}
