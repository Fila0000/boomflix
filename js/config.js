// ===== BOOMFLIX CONFIG =====
const CONFIG = {
  // TMDB API - Free key from themoviedb.org
  TMDB_KEY: '8265bd1679663a7ea12ac168da84d2e8',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMG: 'https://image.tmdb.org/t/p',
  
  // Streaming embed providers (pirated content hosts)
  EMBED_SERVERS: [
    { name: 'Server 1', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { name: 'Server 2', url: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: 'Server 3', url: (id) => `https://embed.su/embed/movie/${id}` },
    { name: 'Server 4', url: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { name: 'Server 5', url: (id) => `https://www.2embed.cc/embed/${id}` },
  ],
  
  SITE_NAME: 'BoomFlix',
  TAGLINE: 'Stream Anything. Free.',
};

// Genre map
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western'
};
