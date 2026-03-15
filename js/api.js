// ===== BOOMFLIX API =====
const API = {
  async fetch(endpoint, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE}${endpoint}`);
    url.searchParams.set('api_key', CONFIG.TMDB_KEY);
    url.searchParams.set('language', 'en-US');
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      return null;
    }
  },

  img(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750/1a1a1a/666?text=No+Image';
    return `${CONFIG.TMDB_IMG}/${size}${path}`;
  },

  backdrop(path, size = 'w1280') {
    if (!path) return '';
    return `${CONFIG.TMDB_IMG}/${size}${path}`;
  },

  async trending(page = 1) {
    return this.fetch('/trending/movie/week', { page });
  },

  async popular(page = 1) {
    return this.fetch('/movie/popular', { page });
  },

  async topRated(page = 1) {
    return this.fetch('/movie/top_rated', { page });
  },

  async nowPlaying(page = 1) {
    return this.fetch('/movie/now_playing', { page });
  },

  async upcoming(page = 1) {
    return this.fetch('/movie/upcoming', { page });
  },

  async byGenre(genreId, page = 1) {
    return this.fetch('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' });
  },

  async details(id) {
    return this.fetch(`/movie/${id}`, { append_to_response: 'credits,similar,videos' });
  },

  async search(query, page = 1) {
    return this.fetch('/search/movie', { query, page });
  },

  formatRuntime(mins) {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  },

  formatRating(r) {
    if (!r) return 'N/A';
    return (Math.round(r * 10) / 10).toFixed(1);
  },

  getYear(date) {
    if (!date) return '';
    return date.split('-')[0];
  },

  genreNames(ids = []) {
    return ids.slice(0, 3).map(id => GENRES[id] || '').filter(Boolean);
  }
};
