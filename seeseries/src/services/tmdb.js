const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;

export const getSeries = (id) =>
  fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=ko-KR`)
    .then(r => r.json());

export const getSeason = (id, seasonNumber) =>
  fetch(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${TMDB_KEY}&language=ko-KR`)
    .then(r => r.json());
