[12:01 am, 21/11/2025] Henry Paul: /* ---------- Upgraded Testimonial Widget (T1) ---------- */
.testimonials-widget { margin: 2.25rem 0; }
.tw-card { background: transparent; padding: 0.6rem 0; }
.tw-head { margin-bottom: 12px; }
.tw-title { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
.tw-sub { margin: 2px 0 0; color: #6b7280; font-size: .95rem; }
.tw-badge-wrap { display:flex; align-items:center; gap:.5rem; }

/* Controls */
.tw-controls { display:flex; justify-content:flex-end; gap:.5rem; margin-bottom:8px; }
.tw-nav { background:#ffffff; border:1px solid rgba(15,23,42,0.06); padding:.45rem .6rem; border-radius:8px; cursor:pointer; font-weight:700; }

/* Track & slides */
.tw-track-wrap { overflow:hidden; }
.tw-track { display:flex; gap:12px; transition: transform .45s cubic-bezier(.2,.9,.2,1); will-change: transform; padding-bottom:6px; }

/* Single card */
.tw-slide { min-width:280px; flex:0 0 280px; box-sizing:border-box; }
.tw-slide .card { background:#fff; border-radius:12px; padding:16px; box-shadow: 0 10px 30px rgba(15,23,42,0.06); height:100%; display:flex; flex-direction:column; justify-content:space-between; }
.tw-quote { color:#111827; line-height:1.5; font-size:0.98rem; margin:0 0 12px; white-space:pre-wrap; }
.tw-author { margin-top:8px; font-weight:700; color:#0f172a; }
.tw-stars { color:#f59e0b; margin-bottom:8px; }

/* CTA on card */
.tw-card-cta { margin-top:12px; align-self:flex-start; background: #8b2b58; color:#fff; padding:8px 12px; border-radius:8px; border:0; cursor:pointer; font-weight:700; }

/* Responsive columns:
   Desktop (>=992px): show 3
   Tablet (>=768px): show 2
   Mobile: 1
*/
@media (min-width:992px) {
  .tw-slide { min-width: calc((100% - 24px) / 3); flex:0 0 calc((100% - 24px) / 3); }
}
@media (min-width:768px) and (max-width:991px) {
  .tw-slide { min-width: calc((100% - 12px) / 2); flex:0 0 calc((100% - 12px) / 2); }
}
@media (max-width:767px) {
  .tw-slide { min-width: 100%; flex:0 0 100%; }
}

/* Accessibility focus */
.tw-nav:focus, .tw-card-cta:focus { outline: 3px solid rgba(139,43,88,0.18); outline-offset:2px; }

/* Hide duplicates of google-badge if inadvertently present elsewhere - we won't create one */
.google-badge.duplicate-hidden { display: none !important; }
[12:03 am, 21/11/2025] Henry Paul: /* js/testimonials-widget.js
   Testimonials Widget (T1) - keeps Google live reviews + badge
   Usage: include <script src="js/testimonials-widget.js"></script> AFTER site-core.js
*/
(function(){
  'use strict';
  // helpers
  const $ = (s, ctx=document)=> ctx.querySelector(s);
  const $$ = (s, ctx=document)=> Array.from((ctx||document).querySelectorAll(s));
  const escapeHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function initTestimonialsWidget() {
    const container = document.getElementById('testimonials-widget');
    if (!container) return;
    if (container.dataset.twInit === '1') return;
    container.dataset.twInit = '1';

    function fetchAvailableReviews() {
      if (typeof window.fetchGoogleReviews === 'function') {
        try { return Promise.resolve(window.fetchGoogleReviews()); } catch(e){ /prune/ }
      }
      if (Array.isArray(window.GOOGLE_REVIEWS) && window.GOOGLE_REVIEWS.length) {
        return Promise.resolve(window.GOOGLE_REVIEWS);
      }
      if (Array.isArray(window.TESTIMONIALS) && window.TESTIMONIALS.length) {
        const mapped = window.TESTIMONIALS.map(r => ({
          author: r.name || r.author || 'Parent',
          text: r.quote || r.text || '',
          rating: typeof r.rating === 'number' ? r.rating : 5,
          time: r.time || r.date || '',
          profile: r.profile_photo_url || r.profile || '',
          source: r.source || 'local'
        }));
        return Promise.resolve(mapped);
      }
      return Promise.resolve([]);
    }

    function dedupeReviews(reviews) {
      const seen = new Set();
      const out = [];
      for (const r of reviews) {
        const key = ((r.author||'') + '||' + (r.text||'')).trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(r);
      }
      return out;
    }

    function pickTopFive(reviews) {
      const withRating = (reviews||[]).map(r => ({
        author: r.author || r.name || 'Parent',
        text: r.text || r.review || r.quote || '',
        rating: (typeof r.rating === 'number') ? r.rating : (r.rating ? Number(r.rating) : 5),
        time: r.time || r.relative_time_description || r.date || '',
        profile: r.profile || ''
      }));
      withRating.sort((a,b)=> (b.rating - a.rating));
      let fiveStar = withRating.filter(r => r.rating >= 5);
      if (fiveStar.length < 5) {
        const others = withRating.filter(r => r.rating < 5);
        fiveStar = fiveStar.concat(others).slice(0,5);
      } else {
        fiveStar = fiveStar.slice(0,5);
      }
      return fiveStar;
    }

    function renderSlides(finalReviews) {
      const track = container.querySelector('#tw-track');
      if (!track) return;
      track.innerHTML = '';
      finalReviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'tw-slide';
        card.innerHTML = `
          <div class="card">
            <div>
              <div class="tw-stars" aria-hidden="true">${renderStars(r.rating)}</div>
              <p class="tw-quote">${escapeHtml(r.text)}</p>
            </div>
            <div>
              <div class="tw-author">${escapeHtml(r.author)}</div>
              <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
                <button class="tw-card-cta open-contact-modal" data-program="Enquiry - ${escapeHtml(r.author)}">Enquire</button>
                ${r.source && r.source.toLowerCase().includes('google') ? '<span class="tw-source-tag" style="font-size:.85rem;color:#6b7280">Google</span>' : ''}
              </div>
            </div>
          </div>
        `;
        track.appendChild(card);
      });
    }

    function renderStars(n) {
      const rating = Math.round(Number(n) || 0);
      let html = '';
      for (let i=0;i<5;i++){
        if (i < rating) html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.265L12 19.771 4.584 23.86 6 15.595 0 9.748l8.332-1.73L12 .587z"/></svg>';
        else html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.265L12 19.771 4.584 23.86 6 15.595 0 9.748l8.332-1.73L12 .587z" stroke-width="1"/></svg>';
      }
      return html;
    }

    function initSliderLogic() {
      const track = container.querySelector('.tw-track');
      const prev = container.querySelector('#tw-prev');
      const next = container.querySelector('#tw-next');
      const slides = () => Array.from(track.children);
      let index = 0;

      function visibleCount() {
        const w = container.getBoundingClientRect().width;
        if (w >= 992) return 3;
        if (w >= 768) return 2;
        return 1;
      }

      function update() {
        const cards = slides();
        if (!cards.length) return;
        const gap = 12;
        const first = cards[0];
        const cardWidth = first.getBoundingClientRect().width + gap;
        const visible = visibleCount();
        const maxIndex = Math.max(0, cards.length - visible);
        if (index > maxIndex) index = maxIndex;
        track.style.transform = translateX(${-(cardWidth * index)}px);
      }

      prev && prev.addEventListener('click', ()=> { index = Math.max(0, index - 1); update(); });
      next && next.addEventListener('click', ()=> { index = Math.min(index + 1, Math.max(0, slides().length - visibleCount())); update(); });

      let auto = setInterval(()=> { index = (index + 1) % Math.max(1, slides().length); update(); }, 6000);
      container.addEventListener('mouseenter', ()=> clearInterval(auto));
      container.addEventListener('mouseleave', ()=> auto = setInterval(()=> { index = (index + 1) % Math.max(1, slides().length); update(); }, 6000));
      window.addEventListener('resize', debounce(update,120));
      setTimeout(update,60);
    }

    function debounce(fn, ms=100){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), ms); }; }

    fetchAvailableReviews().then(raw => {
      const normalised = (Array.isArray(raw) ? raw : []).map(r => ({
        author: r.author || r.name || (r.username || 'Parent'),
        text: r.text || r.review || r.quote || '',
        rating: (typeof r.rating === 'number') ? r.rating : (r.rating ? Number(r.rating) : 5),
        time: r.time || r.relative_time_description || r.date || '',
        profile: r.profile_photo_url || r.profile || '',
        source: r.source || (r.google ? 'google' : '')
      }));
      const deduped = dedupeReviews(normalised);
      const topFive = pickTopFive(deduped);
      renderSlides(topFive);
      initSliderLogic();

      container.addEventListener('click', function(e){
        const btn = e.target.closest && e.target.closest('.open-contact-modal');
        if (!btn) return;
        const program = btn.dataset.program || '';
        if (typeof window.openUnifiedModal === 'function') {
          window.openUnifiedModal({ program });
        } else {
          const form = document.querySelector('form#contact-form, form.contact-form');
          if (form) {
            const p = form.querySelector('select[name="program"]');
            if (p && program) p.value = program;
            form.scrollIntoView({behavior:'smooth', block:'center'});
          }
        }
      });

    }).catch(err => {
      console.error('Testimonials widget: failed to load reviews', err);
      try {
        if (Array.isArray(window.TESTIMONIALS) && window.TESTIMONIALS.length) {
          const mapped = window.TESTIMONIALS.map(r => ({ author: r.name, text: r.quote, rating: (r.rating||5), source: 'local' }));
          const topFive = mapped.slice(0,5);
          renderSlides(topFive);
          initSliderLogic();
        }
      } catch(e){}
    });
  } // end init

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsWidget);
  } else {
    initTestimonialsWidget();
  }

})();
