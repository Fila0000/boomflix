// ===== BOOMFLIX API =====

// Movies released within this many days are likely still in theaters — not on embed servers yet
const STREAMING_DELAY_DAYS = 90;

const API = {
  // Returns a date string STREAMING_DELAY_DAYS ago (YYYY-MM-DD)
  streamingCutoffDate() {
    const d = new Date();
    d.setDate(d.getDate() - STREAMING_DELAY_DAYS);
    return d.toISOString().split('T')[0];
  },

  // True if a movie is old enough to be on streaming/embed servers
  isStreamable(movie) {
    if (!movie.release_date) return false;
    return movie.release_date <= this.streamingCutoffDate();
  },

  // Filter a results array to only streamable movies
  filterStreamable(results) {
    if (!Array.isArray(results)) return [];
    return results.filter(m => this.isStreamable(m));
  },

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

  // Fetch and auto-filter to only streamable movies
  async _fetchFiltered(endpoint, params = {}) {
    const data = await this.fetch(endpoint, params);
    if (data && data.results) {
      data.results = this.filterStreamable(data.results);
    }
    return data;
  },

  async trending(page = 1) {
    return this._fetchFiltered('/trending/movie/week', { page });
  },

  async popular(page = 1) {
    return this._fetchFiltered('/movie/popular', { page });
  },

  async topRated(page = 1) {
    return this._fetchFiltered('/movie/top_rated', { page });
  },

  // "Now Playing" removed — use discoverStreamable instead
  // "Upcoming" removed — those movies aren't out yet

  // Discover movies guaranteed to be on streaming (released 90–730 days ago, sorted by popularity)
  async recentlyStreaming(page = 1) {
    const cutoff = this.streamingCutoffDate();
    // 2 years back from the cutoff as the oldest
    const oldest = new Date();
    oldest.setFullYear(oldest.getFullYear() - 2);
    const oldestStr = oldest.toISOString().split('T')[0];
    return this.fetch('/discover/movie', {
      page,
      sort_by: 'popularity.desc',
      'release_date.lte': cutoff,
      'release_date.gte': oldestStr,
      'vote_count.gte': 100
    });
  },

  // All-time popular streamable movies (no date restriction, just filtered)
  async byGenre(genreId, page = 1) {
    const cutoff = this.streamingCutoffDate();
    return this.fetch('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
      'release_date.lte': cutoff,
      'vote_count.gte': 50
    });
  },

  // Discover with full param control — always applies streamable cutoff
  async discover(params = {}, page = 1) {
    const cutoff = this.streamingCutoffDate();
    return this.fetch('/discover/movie', {
      page,
      sort_by: 'popularity.desc',
      'release_date.lte': cutoff,
      'vote_count.gte': 50,
      ...params
    });
  },

  async details(id) {
    return this.fetch(`/movie/${id}`, { append_to_response: 'credits,similar,videos' });
  },

  async search(query, page = 1) {
    // Search doesn't support release_date.lte param, so filter client-side
    const data = await this.fetch('/search/movie', { query, page });
    if (data && data.results) {
      data.results = this.filterStreamable(data.results);
    }
    return data;
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
