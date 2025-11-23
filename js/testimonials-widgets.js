/* js/testimonials-widget.js
   Self-contained testimonial widget (T1 - 3 cards desktop).
   - Keeps Google fetching if available (fetchGoogleReviews() or window.GOOGLE_REVIEWS)
   - Falls back to window.TESTIMONIALS if no Google data
   - Dedupes reviews and selects top 5 (prefer 5★)
   - Renders a responsive, accessible slider (3/2/1)
   - Does NOT modify any other site scripts or styles
   - Include this script AFTER your main site JS (site-core.js) on pages where testimonials appear
*/

(function () {
  'use strict';

  // Utilities
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Primary init function (exposed)
  function initTestimonialsWidget() {
    // Try several candidate containers so it works with your existing markup
    const container = document.getElementById('testimonials-widget')
      || document.getElementById('testimonials')
      || document.getElementById('testimonials-container');

    if (!container) {
      // nothing to render; no container present
      return;
    }

    // run-once guard
    if (container.dataset.twInit === '1') return;
    container.dataset.twInit = '1';

    // ensure track exists (create minimal markup if not)
    if (!container.querySelector('.tw-track')) {
      container.innerHTML = `
        <div class="tw-card">
          <div class="tw-head" style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h3 class="tw-title">What Our Parents Say</h3>
              <p class="tw-sub">Real reviews from parents — top-rated feedback from Google & our families.</p>
            </div>
            <div class="tw-badge-wrap"></div>
          </div>
          <div class="tw-controls" aria-hidden="true">
            <button id="tw-prev" class="tw-nav" aria-label="Previous testimonial">◀</button>
            <button id="tw-next" class="tw-nav" aria-label="Next testimonial">▶</button>
          </div>
          <div class="tw-track-wrap" role="region" aria-live="polite">
            <div class="tw-track" id="tw-track"></div>
          </div>
        </div>
      `;
    }

    // Fetch reviews available in the page
    function fetchAvailableReviews() {
      // 1) If site exposes fetchGoogleReviews() that returns a Promise -> use it
      if (typeof window.fetchGoogleReviews === 'function') {
        try {
          return Promise.resolve(window.fetchGoogleReviews());
        } catch (err) {
          // fall through
        }
      }
      // 2) If site exposes GOOGLE_REVIEWS array -> use it
      if (Array.isArray(window.GOOGLE_REVIEWS) && window.GOOGLE_REVIEWS.length) {
        return Promise.resolve(window.GOOGLE_REVIEWS);
      }
      // 3) Fallback to TESTIMONIALS (manual array)
      if (Array.isArray(window.TESTIMONIALS) && window.TESTIMONIALS.length) {
        const mapped = window.TESTIMONIALS.map(r => ({
          author: r.name || r.author || 'Parent',
          text: r.quote || r.text || '',
          rating: typeof r.rating === 'number' ? r.rating : (r.rating ? Number(r.rating) : 5),
          time: r.time || r.date || '',
          profile: r.profile_photo_url || r.profile || '',
          source: r.source || 'local'
        }));
        return Promise.resolve(mapped);
      }
      // Nothing available
      return Promise.resolve([]);
    }

    // Remove duplicate reviews (author + text)
    function dedupe(reviews) {
      const seen = new Set();
      const out = [];
      for (const r of reviews || []) {
        const key = ((r.author || '') + '||' + (r.text || '')).trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(r);
      }
      return out;
    }

    // Pick top five reviews (prefer 5-star)
    function pickTopFive(reviews) {
      const normalized = (reviews || []).map(r => ({
        author: r.author || r.name || 'Parent',
        text: r.text || r.review || r.quote || '',
        rating: (typeof r.rating === 'number') ? r.rating : (r.rating ? Number(r.rating) : 5),
        time: r.time || r.relative_time_description || r.date || '',
        profile: r.profile || r.profile_photo_url || ''
      }));
      // sort by rating desc
      normalized.sort((a, b) => (b.rating - a.rating));
      let five = normalized.filter(x => x.rating >= 5);
      if (five.length < 5) {
        // append others
        const others = normalized.filter(x => x.rating < 5);
        five = five.concat(others).slice(0, 5);
      } else {
        five = five.slice(0, 5);
      }
      return five;
    }

    // Render stars SVGs
    function renderStars(num) {
      const rating = Math.round(Number(num) || 0);
      let html = '';
      for (let i = 0; i < 5; ++i) {
        if (i < rating) {
          html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.265L12 19.771 4.584 23.86 6 15.595 0 9.748l8.332-1.73L12 .587z"/></svg>';
        } else {
          html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.265L12 19.771 4.584 23.86 6 15.595 0 9.748l8.332-1.73L12 .587z" stroke-width="1"/></svg>';
        }
      }
      return html;
    }

    // Render slides into the track
    function renderSlides(list) {
      const track = container.querySelector('#tw-track');
      if (!track) return;
      track.innerHTML = '';
      (list || []).forEach(r => {
        const slide = document.createElement('div');
        slide.className = 'tw-slide';
        slide.innerHTML = `
          <div class="card">
            <div>
              <div class="tw-stars">${renderStars(r.rating)}</div>
              <p class="tw-quote">${esc(r.text)}</p>
            </div>
            <div>
              <div class="tw-author">${esc(r.author)}</div>
              <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
                <button class="tw-card-cta open-contact-modal" data-program="Enquiry - ${esc(r.author)}">Enquire</button>
                ${r.source && String(r.source).toLowerCase().includes('google') ? '<span class="tw-source-tag" style="font-size:.85rem;color:#6b7280">Google</span>' : ''}
              </div>
            </div>
          </div>
        `;
        track.appendChild(slide);
      });
    }

    // Slider controls & behaviour (3/2/1)
    function initSlider() {
      const track = container.querySelector('.tw-track');
      if (!track) return;
      const prevBtn = container.querySelector('#tw-prev');
      const nextBtn = container.querySelector('#tw-next');

      let index = 0;
      function visibleCount() {
        const w = container.getBoundingClientRect().width;
        if (w >= 992) return 3;
        if (w >= 768) return 2;
        return 1;
      }
      function update() {
        const slides = Array.from(track.children);
        if (!slides.length) return;
        const gap = 12; // must match CSS gap
        const first = slides[0];
        const cardWidth = first.getBoundingClientRect().width + gap;
        const visible = visibleCount();
        const max = Math.max(0, slides.length - visible);
        if (index > max) index = max;
        track.style.transform = `translateX(${-(cardWidth * index)}px)`;
      }
      prevBtn && prevBtn.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
      nextBtn && nextBtn.addEventListener('click', () => {
        const slides = Array.from(track.children);
        index = Math.min(index + 1, Math.max(0, slides.length - visibleCount()));
        update();
      });

      // autoplay
      let auto = setInterval(() => {
        const slides = Array.from(track.children);
        index = (index + 1) % Math.max(1, slides.length);
        update();
      }, 6000);

      container.addEventListener('mouseenter', () => clearInterval(auto));
      container.addEventListener('mouseleave', () => auto = setInterval(() => {
        const slides = Array.from(track.children);
        index = (index + 1) % Math.max(1, slides.length);
        update();
      }, 6000));

      window.addEventListener('resize', debounce(update, 120));
      // Small timeout to allow geometry
      setTimeout(update, 80);
    }

    // Debounce helper
    function debounce(fn, wait = 100) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), wait); }; }

    // Final pipeline
    fetchAvailableReviews().then(raw => {
      const normal = (Array.isArray(raw) ? raw : []).map(r => ({
        author: r.author || r.name || r.username || 'Parent',
        text: r.text || r.review || r.quote || '',
        rating: (typeof r.rating === 'number') ? r.rating : (r.rating ? Number(r.rating) : 5),
        time: r.time || r.relative_time_description || r.date || '',
        profile: r.profile || r.profile_photo_url || '',
        source: r.source || (r.provider || (r.google ? 'google' : 'local')) || ''
      }));
      const dedup = dedupe(normal);
      const topFive = pickTopFive(dedup);
      renderSlides(topFive);
      initSlider();

      // wire Enquire buttons inside slides
      container.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.open-contact-modal');
        if (!btn) return;
        const program = btn.dataset.program || '';
        if (typeof window.openUnifiedModal === 'function') {
          window.openUnifiedModal({ program });
        } else {
          // fallback: scroll to first contact form
          const f = document.querySelector('form#contact-form, form.contact-form');
          if (f) {
            const p = f.querySelector('select[name="program"], input[name="program"]');
            if (p && program) p.value = program;
            f.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });

    }).catch(err => {
      console.error('Testimonials Widget: error loading reviews', err);
      // fallback: try TESTIMONIALS
      try {
        if (Array.isArray(window.TESTIMONIALS) && window.TESTIMONIALS.length) {
          const mapped = window.TESTIMONIALS.map(r => ({ author: r.name, text: r.quote, rating: r.rating || 5, source: 'local' }));
          const top = mapped.slice(0, 5);
          renderSlides(top);
          initSlider();
        }
      } catch (e) { /* silent */ }
    });
  } // end init

  // Expose init for manual re-render if needed
  window.initTestimonialsWidget = initTestimonialsWidget;

  // Auto-run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsWidget);
  } else {
    initTestimonialsWidget();
  }

})();
