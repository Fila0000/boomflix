// ===== BOOMFLIX UI HELPERS =====
const UI = {
  // Create a movie card element
  card(movie, wide = false) {
    const el = document.createElement('div');
    el.className = `movie-card${wide ? ' wide' : ''}`;
    const imgSrc = wide
      ? API.img(movie.backdrop_path, 'w780')
      : API.img(movie.poster_path, 'w342');
    const rating = API.formatRating(movie.vote_average);
    const year = API.getYear(movie.release_date);
    const genres = API.genreNames(movie.genre_ids || []);

    el.innerHTML = `
      <img src="${imgSrc}" alt="${movie.title || ''}" loading="lazy" 
           onerror="this.src='https://via.placeholder.com/${wide ? '780x440' : '342x513'}/1a1a1a/555?text=No+Image'">
      <div class="movie-card-overlay">
        <div class="movie-card-actions">
          <button class="card-btn play-btn" title="Play">▶</button>
          <button class="card-btn info-btn" title="More Info">ⓘ</button>
        </div>
        <div class="movie-card-title">${movie.title || 'Unknown'}</div>
        <div class="movie-card-meta">
          <span class="movie-card-rating">★ ${rating}</span>
          <span>${year}</span>
          ${genres[0] ? `<span>${genres[0]}</span>` : ''}
        </div>
      </div>
    `;

    // Play button → go to player
    el.querySelector('.play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `watch.html?id=${movie.id}`;
    });

    // Info button → open modal
    el.querySelector('.info-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Modal.open(movie.id);
    });

    // Card click → open modal
    el.addEventListener('click', () => Modal.open(movie.id));

    return el;
  },

  // Render skeleton placeholders
  skeletons(count = 6, wide = false) {
    return Array.from({ length: count }, () => {
      const el = document.createElement('div');
      el.className = `skeleton skeleton-card${wide ? ' wide' : ''}`;
      if (wide) el.style.aspectRatio = '16/9';
      return el;
    });
  },

  // Setup carousel scroll buttons
  setupCarousel(wrapper) {
    const carousel = wrapper.querySelector('.carousel');
    const prev = wrapper.querySelector('.carousel-btn.prev');
    const next = wrapper.querySelector('.carousel-btn.next');
    if (!carousel || !prev || !next) return;

    const scroll = (dir) => {
      const amount = carousel.clientWidth * 0.8;
      carousel.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    prev.addEventListener('click', () => scroll(-1));
    next.addEventListener('click', () => scroll(1));

    const updateBtns = () => {
      prev.style.opacity = carousel.scrollLeft > 0 ? '1' : '0';
      next.style.opacity = carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 10 ? '1' : '0';
    };

    carousel.addEventListener('scroll', updateBtns);
    updateBtns();
  },

  // Show a toast notification
  toast(msg, duration = 2500) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  },

  // Navbar scroll behavior
  initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    if (nav.classList.contains('solid')) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  },

  // Render a full section with carousel
  async renderSection(container, title, fetchFn, wide = false) {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `
      <div class="section-title">
        ${title}
        <span class="explore-more">Explore All ›</span>
      </div>
      <div class="carousel-wrapper">
        <button class="carousel-btn prev">‹</button>
        <div class="carousel">
          ${UI.skeletons(wide ? 4 : 6, wide).map(s => s.outerHTML).join('')}
        </div>
        <button class="carousel-btn next">›</button>
      </div>
    `;
    container.appendChild(section);
    UI.setupCarousel(section.querySelector('.carousel-wrapper'));

    const data = await fetchFn();
    const carousel = section.querySelector('.carousel');
    carousel.innerHTML = '';

    if (data && data.results) {
      data.results.slice(0, 18).forEach(movie => {
        carousel.appendChild(UI.card(movie, wide));
      });
    }
    return section;
  }
};

// ===== MODAL =====
const Modal = {
  el: null,

  init() {
    this.el = document.getElementById('modal');
    if (!this.el) return;

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  async open(movieId) {
    if (!this.el) return;
    this.el.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.el.innerHTML = `
      <div class="modal">
        <div class="modal-hero">
          <div class="skeleton" style="width:100%;height:100%;position:absolute;inset:0;"></div>
        </div>
        <div class="modal-body">
          <div class="spinner"></div>
        </div>
        <button class="modal-close" onclick="Modal.close()">✕</button>
      </div>
    `;

    const movie = await API.details(movieId);
    if (!movie) {
      this.el.innerHTML = `<div class="modal" style="padding:40px;text-align:center;">
        <button class="modal-close" onclick="Modal.close()">✕</button>
        <p>Failed to load movie details.</p>
      </div>`;
      return;
    }

    const genres = (movie.genres || []).map(g => g.name);
    const runtime = API.formatRuntime(movie.runtime);
    const year = API.getYear(movie.release_date);
    const rating = API.formatRating(movie.vote_average);
    const backdropUrl = API.backdrop(movie.backdrop_path, 'w1280');

    this.el.innerHTML = `
      <div class="modal">
        <button class="modal-close" onclick="Modal.close()">✕</button>
        <div class="modal-hero">
          ${backdropUrl ? `<img src="${backdropUrl}" alt="${movie.title}" loading="lazy">` : ''}
          <div class="modal-hero-content">
            <a href="watch.html?id=${movie.id}" class="btn btn-play" style="font-size:0.9rem;padding:10px 22px;">
              ▶ Play
            </a>
            <button class="btn btn-info" style="font-size:0.9rem;padding:10px 22px;" 
              onclick="window.location.href='watch.html?id=${movie.id}'">
              More Info
            </button>
          </div>
        </div>
        <div class="modal-body">
          <h2 class="modal-title">${movie.title}</h2>
          <div class="modal-meta">
            <span class="modal-rating">★ ${rating}</span>
            <span class="modal-year">${year}</span>
            ${runtime ? `<span class="modal-runtime">${runtime}</span>` : ''}
            <span class="modal-hd">HD</span>
            ${movie.vote_count ? `<span class="modal-lang" style="color:#aaa;">${movie.vote_count.toLocaleString()} votes</span>` : ''}
          </div>
          <p class="modal-description">${movie.overview || 'No description available.'}</p>
          ${genres.length ? `
          <div class="modal-genres">
            ${genres.map(g => `<span class="modal-genre-tag">${g}</span>`).join('')}
          </div>` : ''}
          <div class="modal-actions">
            <a href="watch.html?id=${movie.id}" class="btn btn-primary">▶ Watch Now</a>
          </div>
        </div>
      </div>
    `;
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove('active');
    document.body.style.overflow = '';
  }
};
