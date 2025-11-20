/* js/site-core.js
   Unified site script: menu, whatsapp FAB, form (EmailJS), testimonials, gallery slider, FAQ, blog modal, lightbox.
   NOTE: This version removes any Google badge/link output in the testimonial widget.
   EmailJS credentials are used as provided by you earlier.
*/

(function () {
  'use strict';

  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_14zrdg6',
    TEMPLATE_ID: 'template_snxhxlk',
    PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
  };

  // Basic helpers
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Initialize EmailJS if present
  if (window.emailjs && typeof emailjs.init === 'function') {
    try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch (e) { console.warn('emailjs.init error', e); }
  }

  /* -----------------------
     Mobile menu (burger)
  ------------------------*/
  function initMenu() {
    const btns = $$('#menu-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        if (!menu) return;
        menu.classList.toggle('hidden');
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', (!expanded).toString());
      });
    });
    // also close mobile menu on nav click
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.addEventListener('click', e => {
        if (e.target.tagName === 'A') mobileMenu.classList.add('hidden');
      });
    }
  }

  /* -----------------------
     WhatsApp FAB (ensures presence)
  ------------------------*/
  function ensureWhatsAppFab() {
    if (document.getElementById('whatsapp-chat-button')) return;
    const a = document.createElement('a');
    a.id = 'whatsapp-chat-button';
    a.className = 'whatsapp-fab';
    a.href = 'https://wa.me/919032249494?text=Hello%2C%20I%20am%20interested%20in%20St.%20Vincent%27s%20Preschool';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = '<div class="fab-inner" aria-hidden="true"><i class="fab fa-whatsapp"></i></div>';
    document.body.appendChild(a);
  }

  /* -----------------------
     Unified modal form (and inline form handler)
  ------------------------*/
  function createUnifiedModal(prefill = {}) {
    // remove existing
    const existing = document.querySelector('.modal-overlay.unified');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay unified';
    overlay.innerHTML = `
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <h3 style="margin:0;color:var(--brand)">Schedule a Visit</h3>
            <p style="margin:0;color:var(--muted)">We'd love to show you around our campus!</p>
          </div>
          <button class="close-modal" aria-label="Close" style="border:none;background:transparent;font-size:22px;cursor:pointer">&times;</button>
        </div>

        <form id="contact-form-modal" class="contact-form">
            <div class="form-group"><label for="parentName_modal">Parent's Name</label><input id="parentName_modal" name="parentName" required></div>
            <div class="form-group"><label for="phone_modal">Phone Number</label><input id="phone_modal" name="phone" type="tel" required></div>
            <div class="form-group"><label for="childAge_modal">Child's Age</label>
              <select id="childAge_modal" name="childAge" required>
                <option value="">Select age range</option>
                <option value="1.5 to 2 years">1.5 to 2 years</option>
                <option value="2 to 3 years">2 to 3 years</option>
                <option value="3 to 4 years">3 to 4 years</option>
                <option value="4 to 5 years">4 to 5 years</option>
              </select></div>
            <div class="form-group"><label for="program_modal">Program Interested In</label>
              <select id="program_modal" name="program" required>
                <option value="">Select a program</option>
                <option value="playgroup">Playgroup</option>
                <option value="nursery">Nursery</option>
                <option value="lkg">Pre-Primary 1</option>
                <option value="ukg">Pre-Primary 2</option>
                <option value="daycare">Day Care</option>
              </select></div>
            <div class="form-group"><label for="message_modal">Additional Message (Optional)</label>
              <textarea id="message_modal" name="message" rows="3">${escapeHtml(prefill.message || '')}</textarea></div>

            <button type="submit" class="crayon-button" id="submit-modal">
                <span id="submit-text-modal">Submit Inquiry</span>
                <div id="submit-spinner-modal" class="spinner hidden" aria-hidden="true"></div>
            </button>

            <p id="contact-form-success-message-modal" class="form-success hidden">Thank you! We'll call you soon!</p>
            <p id="contact-form-error-message-modal" class="form-error hidden">There was an error submitting your form. Please try again or call us directly.</p>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.close-modal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // prefill if program provided
    if (prefill.program) {
      const p = overlay.querySelector('#program_modal');
      if (p) p.value = prefill.program;
    }
    if (prefill.parentName) overlay.querySelector('#parentName_modal').value = prefill.parentName;

    // attach submission handler
    attachFormHandler(overlay.querySelector('form'));
    return overlay;
  }

  // global openUnifiedModal
  window.openUnifiedModal = function (prefill = {}) {
    return createUnifiedModal(prefill);
  };

  // attach handler to any inline forms and modal forms
  function attachFormHandler(form) {
    if (!form) return;
    if (form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    const submitText = form.querySelector('#submit-text') || form.querySelector('#submit-text-modal');
    const submitSpinner = form.querySelector('#submit-spinner') || form.querySelector('#submit-spinner-modal');
    const successMsg = form.querySelector('#contact-form-success-message') || form.querySelector('#contact-form-success-message-modal');
    const errorMsg = form.querySelector('#contact-form-error-message') || form.querySelector('#contact-form-error-message-modal');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitText) submitText.classList.add('hidden');
      if (submitSpinner) submitSpinner.classList.remove('hidden');
      if (successMsg) successMsg.classList.add('hidden');
      if (errorMsg) errorMsg.classList.add('hidden');

      const parentName = (form.querySelector('input[name="parentName"]') || {}).value || '';
      const phone = (form.querySelector('input[name="phone"]') || {}).value || '';
      const childAge = (form.querySelector('select[name="childAge"]') || {}).value || '';
      const program = (form.querySelector('select[name="program"]') || {}).value || '';
      const message = (form.querySelector('textarea[name="message"]') || {}).value || '';

      if (!parentName || !phone || !childAge || !program) {
        if (errorMsg) { errorMsg.textContent = 'Please fill all required fields.'; errorMsg.classList.remove('hidden'); }
        if (submitText) submitText.classList.remove('hidden');
        if (submitSpinner) submitSpinner.classList.add('hidden');
        return;
      }

      const payload = { parentName, phone, childAge, program, message: message || 'N/A', timestamp: new Date().toLocaleString(), source: 'Website Contact Form' };

      if (window.emailjs && typeof emailjs.send === 'function') {
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload)
          .then(() => {
            if (successMsg) successMsg.classList.remove('hidden');
            form.reset();
            if (submitText) submitText.classList.remove('hidden');
            if (submitSpinner) submitSpinner.classList.add('hidden');
            setTimeout(() => {
              const overlay = form.closest('.modal-overlay, .unified');
              if (overlay && overlay.classList.contains('unified')) overlay.remove();
              if (successMsg) successMsg.classList.add('hidden');
            }, 5000);
          })
          .catch(err => {
            console.error('EmailJS error', err);
            if (errorMsg) errorMsg.classList.remove('hidden');
            if (submitText) submitText.classList.remove('hidden');
            if (submitSpinner) submitSpinner.classList.add('hidden');
          });
      } else {
        console.warn('emailjs not available; fallback log', payload);
        if (successMsg) successMsg.classList.remove('hidden');
        if (submitText) submitText.classList.remove('hidden');
        if (submitSpinner) submitSpinner.classList.add('hidden');
        setTimeout(()=> {
          const overlay = form.closest('.modal-overlay, .unified');
          if (overlay && overlay.classList.contains('unified')) overlay.remove();
          if (successMsg) successMsg.classList.add('hidden');
        }, 3000);
      }
    });
  }

  /* -----------------------
     Testimonials (manual 5)
     NOTE: Google badge/link removed in this version.
  ------------------------*/
  const TESTIMONIALS = [
    { name: "Sai Ram", quote: "My child has shown lot of development and he is now more confident after joining St. Vincent's Preschool." },
    { name: "Latha B.", quote: "St. Vincent's has excellent facilities and a clean, well-maintained campus that supports learning." },
    { name: "Shashank Bhardwaj", quote: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing." },
    { name: "Saurabh Shourie", quote: "Great environment with lesser fees in comparison to other schools nearby. Highly recommended!" },
    { name: "Anita Singha", quote: "Recently my daughter joined and she's very happy. Spacious, hygienic and experienced teachers." }
  ];

  function renderTestimonials() {
    const container = document.getElementById('testimonials') || document.getElementById('testimonials-container');
    if (!container) return;

    // Build the wrapper only if not already present
    if (!container.querySelector('.testimonials-wrapper')) {
      container.innerHTML = `
        <div class="testimonials-wrapper">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h3 style="margin:0">What Our Parents Say</h3>
            <div>
              <button id="testi-prev" class="testi-nav" aria-label="Previous testimonial">◀</button>
              <button id="testi-next" class="testi-nav" aria-label="Next testimonial">▶</button>
            </div>
          </div>
          <div style="overflow:hidden"><div class="testi-inner"></div></div>
        </div>
      `;
    }

    const inner = container.querySelector('.testi-inner');
    if (!inner) return;

    inner.innerHTML = '';
    TESTIMONIALS.forEach(t => {
      const card = document.createElement('div');
      card.className = 'testi-card';
      card.innerHTML = `<div class="card"><p style="margin:0">${escapeHtml(t.quote)}</p><p style="margin-top:12px;font-weight:700">${escapeHtml(t.name)}</p><div style="margin-top:8px"><button class="btn-small open-contact-modal" data-program="Enquiry - ${escapeHtml(t.name)}">Enquire</button></div></div>`;
      inner.appendChild(card);
    });

    // slider logic
    const cards = inner.children;
    let idx = 0;
    const prev = container.querySelector('#testi-prev');
    const next = container.querySelector('#testi-next');
    function update() {
      if (!cards.length) return;
      const gap = 12;
      const w = cards[0].getBoundingClientRect().width + gap;
      const visible = Math.max(1, Math.floor(container.getBoundingClientRect().width / w));
      const max = Math.max(0, cards.length - visible);
      if (idx > max) idx = max;
      inner.style.transform = `translateX(${-(w * idx)}px)`;
    }
    prev && prev.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
    next && next.addEventListener('click', () => { idx = Math.min(idx + 1, TESTIMONIALS.length - 1); update(); });
    window.addEventListener('resize', debounce(update, 120));
    setTimeout(update, 50);
    let auto = setInterval(()=> { idx = (idx+1)%TESTIMONIALS.length; update(); }, 6000);
    container.addEventListener('mouseenter', ()=> clearInterval(auto));
    container.addEventListener('mouseleave', ()=> auto = setInterval(()=> { idx = (idx+1)%TESTIMONIALS.length; update(); }, 6000));
  }

  /* -----------------------
     Gallery slider & lightbox
  ------------------------*/
  function initGallery() {
    // slider
    const track = document.getElementById('image-slider');
    if (track) {
      const slides = track.children;
      let pos = 0;
      const prev = document.getElementById('slide-prev');
      const next = document.getElementById('slide-next');
      function update() {
        if (!slides.length) return;
        const w = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(${-(w * pos)}px)`;
      }
      prev && prev.addEventListener('click', ()=> { pos = Math.max(0, pos-1); update(); });
      next && next.addEventListener('click', ()=> { pos = Math.min(pos+1, slides.length-1); update(); });
      window.addEventListener('resize', debounce(update, 120));
      setTimeout(update, 60);
    }

    // lightbox: listens for .responsive-img or .gallery-item img or .video-poster
    const mediaModal = createMediaModal();
    const targets = Array.from(document.querySelectorAll('img.responsive-img, .gallery-item img, img[data-full], .video-poster, .responsive-frame img'));
    targets.forEach(img => {
      if (img.dataset.scc) return;
      img.dataset.scc = '1';
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const src = img.dataset.full || img.src;
        const video = img.dataset.video || img.getAttribute('data-video') || '';
        openMedia(mediaModal, {src, video});
      });
    });
  }

  function createMediaModal() {
    let modal = document.getElementById('scc-media-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'scc-media-modal';
    modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:10000;padding:20px;';
    const inner = document.createElement('div');
    inner.className = 'modal-card';
    inner.style.background = 'transparent';
    inner.innerHTML = '<div id="scc-media-content" style="max-width:1000px;width:100%;height:100%"></div><button id="scc-media-close" style="position:fixed;right:18px;top:18px;background:#fff;border-radius:999px;padding:8px;border:0;cursor:pointer">✕</button>';
    modal.appendChild(inner);
    document.body.appendChild(modal);
    $('#scc-media-close').addEventListener('click', ()=> { modal.style.display='none'; $('#scc-media-content').innerHTML=''; document.body.style.overflow=''; });
    modal.addEventListener('click', (e)=> { if (e.target === modal) { modal.style.display='none'; $('#scc-media-content').innerHTML=''; document.body.style.overflow=''; } });
    return modal;
  }

  function openMedia(modal, {src, video}) {
    const content = $('#scc-media-content');
    content.innerHTML = '';
    if (video) {
      if (video.includes('youtube') || video.includes('youtu.be')) {
        let id = '';
        try {
          if (video.includes('youtu.be')) id = video.split('/').pop();
          else id = (new URL(video)).searchParams.get('v')||'';
        } catch(e){ id = ''; }
        if (id) content.innerHTML = `<div style="position:relative;padding-top:56.25%"><iframe src="https://www.youtube.com/embed/${escapeHtml(id)}" frameborder="0" allowfullscreen style="position:absolute;left:0;top:0;width:100%;height:100%"></iframe></div>`;
      } else {
        content.innerHTML = `<video controls playsinline style="width:100%;height:auto"><source src="${escapeHtml(video)}" type="video/mp4"></video>`;
      }
    } else if (src) {
      content.innerHTML = `<img src="${escapeHtml(src)}" style="width:100%;height:auto;display:block;border-radius:8px" alt="">`;
    } else {
      content.textContent = 'Media unavailable';
    }
    const modalEl = document.getElementById('scc-media-modal');
    modalEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /* -----------------------
     FAQ (10 items)
  ------------------------*/
  const FAQ_ITEMS = [
    {q:"What is the ideal age to start preschool?", a:"We accept children from 1.5 years. We advise parents to start when the child shows interest in social play and basic routines."},
    {q:"How do you handle separation anxiety?", a:"Our teachers use short, predictable goodbyes, gradual separations and comforting routines to ease anxiety."},
    {q:"What is the teacher:child ratio?", a:"We maintain low ratios to ensure personalised attention; exact ratio varies by age group."},
    {q:"What is your curriculum approach?", a:"We follow a play-based EYFS-inspired approach focused on language, maths readiness, social skills and physical development."},
    {q:"Are meals provided?", a:"We offer nutritious snacks; parents can pack meals if required. We manage allergies carefully - please inform us."},
    {q:"How do you keep children safe?", a:"CCTV, child-proofed campus, trained staff and strict hygiene protocols are in place."},
    {q:"Can parents visit?", a:"Yes — we offer scheduled campus tours. Use 'Schedule a Visit' to book a time."},
    {q:"Do you offer daycare?", a:"Yes — structured daycare for working parents is available with supervised rest & activities."},
    {q:"How do you assess progress?", a:"Regular observation, portfolios and parent-teacher discussions track learning and development."},
    {q:"What are the operating hours?", a:"Monday–Friday 8:00–18:00, Saturday 8:00–16:00. Holiday schedule is shared annually."}
  ];

  function renderFAQ() {
    const list = document.getElementById('faq-list');
    if (!list) return;
    list.innerHTML = '';
    FAQ_ITEMS.forEach((f, idx) => {
      const item = document.createElement('div'); item.className = 'faq-item';
      item.innerHTML = `
        <div class="faq-q" data-idx="${idx}">
          <div><strong>${escapeHtml(f.q)}</strong></div>
          <div class="faq-toggle">+</div>
        </div>
        <div class="faq-a" id="faq-a-${idx}"><div class="faq-a-inner">${escapeHtml(f.a)}</div><div style="margin-top:8px"><button class="btn-small open-contact-modal" data-program="Enquiry from FAQ: ${escapeHtml(f.q)}">Enquire</button></div></div>
      `;
      list.appendChild(item);
    });
    $$('.faq-q').forEach(q => q.addEventListener('click', e => {
      const idx = q.dataset.idx;
      const a = document.getElementById('faq-a-' + idx);
      if (!a) return;
      if (a.classList.contains('open')) {
        a.style.maxHeight = '0px'; a.classList.remove('open'); q.querySelector('.faq-toggle').textContent = '+';
      } else {
        a.style.maxHeight = a.scrollHeight + 'px'; a.classList.add('open'); q.querySelector('.faq-toggle').textContent = '−';
      }
    }));
  }

  /* -----------------------
     Blog modal (scrollable)
  ------------------------*/
  const BLOG_POSTS = {
    1: {title:'Why Play Matters', body:`<p><strong>Play builds foundations...</strong></p><p>Play-based learning supports cognitive, physical and social growth.</p>`},
    2: {title:'Social Skills Development', body:`<p>Sharing, turn-taking and role-play...</p>`},
    3: {title:'Preparing for Primary School', body:`<p>Building independence, fine motor skills and routines.</p>`}
  };

  function initBlogModal() {
    const blogModal = $('#blog-modal');
    if (!blogModal) return;
    const body = $('#blog-modal-body');
    const close = blogModal.querySelector('.modal-close');
    close && close.addEventListener('click', ()=> blogModal.classList.add('hidden'));
    blogModal.addEventListener('click', (e)=> { if (e.target === blogModal) blogModal.classList.add('hidden'); });

    $$('.open-blog').forEach(btn => btn.addEventListener('click', ()=> {
      const id = btn.dataset.blogId;
      const post = BLOG_POSTS[id];
      if (!post) return;
      body.innerHTML = `<h2>${escapeHtml(post.title)}</h2><div class="modal-inner-scroll">${post.body}</div>`;
      blogModal.classList.remove('hidden');
      // ensure inner scroll top
      const inner = body.querySelector('.modal-inner-scroll');
      if (inner) inner.scrollTop = 0;
    }));
  }

  /* -----------------------
     Utilities
  ------------------------*/
  function debounce(fn, wait=100){let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn.apply(this,a), wait)}}

  /* -----------------------
     Boot
  ------------------------*/
  document.addEventListener('DOMContentLoaded', ()=> {
    try {
      initMenu();
      ensureWhatsAppFab();
      renderTestimonials();
      initGallery();
      renderFAQ();
      initBlogModal();

      // attach inline forms
      $$('form.contact-form, form#contact-form').forEach(f => attachFormHandler(f));

      // wire open-contact-modal buttons
      document.addEventListener('click', (e)=> {
        const el = e.target.closest && e.target.closest('.open-contact-modal');
        if (!el) return;
        const program = el.dataset.program || '';
        openUnifiedModal({ program });
      });

      // hero schedule button
      const heroBtn = document.getElementById('schedule-visit-hero');
      if (heroBtn) heroBtn.addEventListener('click', ()=> openUnifiedModal({}));

    } catch (err) {
      console.error('site-core init error', err);
    }
  });

})();
