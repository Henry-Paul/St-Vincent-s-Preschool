/* site-core.js - focused patch
   ONLY changes:
   - form submission behavior to match uploaded HTML form fields + EmailJS keys
   - replaces live Google reviews with manual 5-item testimonial slider
   - adds a responsive media frame / lightbox for images & videos
   DOES NOT override existing site functions (like openUnifiedModal) if present.
*/

(function () {
  'use strict';

  // ---------- Config (from your uploaded HTML) ----------
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_14zrdg6',
    TEMPLATE_ID: 'template_snxhxlk',
    PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
  };

  // ---------- Small helpers ----------
  function $q(sel, ctx = document) { return ctx.querySelector(sel); }
  function $qa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
  function escapeHtml(s = '') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function throttle(fn, wait=200){ let t=0; return (...a)=>{ const now=Date.now(); if(now - t > wait){ t = now; fn.apply(this,a);} } }

  // ---------- Preserve existing openUnifiedModal if present ----------
  const hasGlobalUnified = typeof window.openUnifiedModal === 'function';

  // ---------- 1) FORM SUBMISSION PATCH ----------
  // We'll attach one submission handler to any modal form that matches your form fields.
  function initContactFormPatch() {
    // Wait for DOM forms that match expected inputs
    const selectorCandidates = [
      '#contact-form',               // explicit contact-form
      'form.contact-form',           // generic
      'form[data-contact="true"]'
    ];
    const forms = selectorCandidates.map(s => $q(s)).filter(Boolean);

    // If no explicit forms yet, also bind to future modal creation (mutation observer)
    function bindToForm(form) {
      if (!form || form.dataset.sccBound === '1') return;
      form.dataset.sccBound = '1';

      // find fields (fall back tolerant)
      const parentName = form.querySelector('#parentName') || form.querySelector('input[name="parentName"]') || form.querySelector('input[name="name"]');
      const phone = form.querySelector('#phone') || form.querySelector('input[name="phone"]') || form.querySelector('input[type="tel"]');
      const childAge = form.querySelector('#childAge') || form.querySelector('input[name="childAge"]') || form.querySelector('input[name="child_age"]');
      const program = form.querySelector('#program') || form.querySelector('select[name="program"]') || form.querySelector('input[name="program"]');
      const message = form.querySelector('#message') || form.querySelector('textarea[name="message"]');

      // create simple message nodes if absent
      let successNode = form.querySelector('.scc-success');
      let errorNode = form.querySelector('.scc-error');
      if (!successNode) { successNode = document.createElement('div'); successNode.className = 'scc-success hidden'; form.appendChild(successNode); }
      if (!errorNode) { errorNode = document.createElement('div'); errorNode.className = 'scc-error hidden'; form.appendChild(errorNode); }

      form.addEventListener('submit', function (ev) {
        ev.preventDefault();

        // basic validation exactly as required
        const nameVal = parentName ? parentName.value.trim() : '';
        const phoneVal = phone ? phone.value.trim() : '';
        const childAgeVal = childAge ? childAge.value.trim() : '';
        const programVal = program ? program.value.trim() : '';
        const messageVal = message ? message.value.trim() : '';

        errorNode.classList.add('hidden');
        successNode.classList.add('hidden');

        if (!nameVal || !phoneVal || !childAgeVal || !programVal) {
          errorNode.textContent = 'Please fill all required fields.';
          errorNode.classList.remove('hidden');
          return;
        }

        // disable submit if exists
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        // Build template params exactly as expected by your template
        const payload = {
          parentName: nameVal,
          phone: phoneVal,
          childAge: childAgeVal,
          program: programVal,
          message: messageVal || 'N/A',
          timestamp: new Date().toLocaleString(),
          source: 'Website Contact Form'
        };

        // Use emailjs if loaded
        if (window.emailjs && typeof emailjs.send === 'function') {
          emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload)
            .then(() => {
              successNode.textContent = 'Thank you! We have received your inquiry.';
              successNode.classList.remove('hidden');
              form.reset();
              if (submitButton) submitButton.disabled = false;
              // try to close modal if it looks like one (common patterns)
              const closestModal = form.closest('.modal-overlay, .contact-modal, .modal');
              if (closestModal) setTimeout(()=> closestModal.remove(), 1600);
            })
            .catch(err => {
              console.error('EmailJS Error', err);
              errorNode.textContent = 'Submission failed. Please try again or call +91 9032249494';
              errorNode.classList.remove('hidden');
              if (submitButton) submitButton.disabled = false;
            });
        } else {
          // fallback: log to console and show success (non-destructive)
          console.warn('emailjs not loaded; fallback submission', payload);
          successNode.textContent = 'Form received (demo mode). Please ensure EmailJS script is included.';
          successNode.classList.remove('hidden');
          if (submitButton) submitButton.disabled = false;
          form.reset();
          const closestModal = form.closest('.modal-overlay, .contact-modal, .modal');
          if (closestModal) setTimeout(()=> closestModal.remove(), 1600);
        }
      });
    }

    // Bind to existing found forms
    forms.forEach(bindToForm);

    // Observe for future forms (e.g., modal created dynamically)
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          const f = node.matches && node.matches('form') ? node : node.querySelector && (node.querySelector('form') || node.querySelector('#contact-form'));
          if (f) bindToForm(f);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------- 2) Replace live Google reviews with manual testimonials ----------
  // Manual testimonials (top 5 five-star feedback - from your provided list)
  const MANUAL_TESTIMONIALS = [
    {name: "Sai Ram", quote: "My child has shown lot of development and he is now more confident after joining st vincent's school."},
    {name: "Latha B.", quote: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning."},
    {name: "Shashank Bhardwaj", quote: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing."},
    {name: "Saurabh Shourie", quote: "Great environment with lesser fees in comparison to other schools nearby. Highly recommended!"},
    {name: "Anita Singha", quote: "Recently my daughter joined and she's very happy. Spacious, hygienic and experienced teachers."}
  ];

  function renderManualTestimonialsOnce() {
    // find container - prefer id="testimonials"
    let container = $q('#testimonials') || $q('#testimonials-container') || $q('.google-reviews') || null;
    if (!container) {
      // insert above footer as a fallback
      const footer = $q('footer') || document.body;
      container = document.createElement('section');
      container.id = 'testimonials';
      footer.parentNode.insertBefore(container, footer);
    }

    // Do not re-render if already rendered by this script
    if (container.dataset.sccRendered === '1') return;
    container.dataset.sccRendered = '1';

    // Clear existing content (including any Google reviews content)
    container.innerHTML = `
      <div class="testimonials-wrapper card">
        <div class="testi-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="margin:0;font-size:20px">What Our Parents Say</h3>
          <div>
            <button id="testi-prev" class="testi-nav">◀</button>
            <button id="testi-next" class="testi-nav">▶</button>
          </div>
        </div>
        <div class="testi-track" style="overflow:hidden">
          <div class="testi-inner" style="display:flex;gap:12px;transition:transform .45s ease"></div>
        </div>
      </div>
    `;

    const inner = container.querySelector('.testi-inner');
    MANUAL_TESTIMONIALS.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = 'testi-card';
      card.style.minWidth = '280px';
      card.style.flex = '0 0 280px';
      card.style.boxSizing = 'border-box';
      card.innerHTML = `
        <div style="padding:16px;background:#fff;border-radius:12px;box-shadow: 0 6px 18px rgba(15,23,42,0.06);height:100%;">
          <p style="margin:0;font-size:15px;color:#111">${escapeHtml(t.quote)}</p>
          <p style="margin:12px 0 0 0;font-weight:700;color:#333">${escapeHtml(t.name)}</p>
          <div style="margin-top:12px"><button class="open-contact-modal btn-small" data-program="Enquiry: ${escapeHtml(t.name)}">Enquire</button></div>
        </div>
      `;
      inner.appendChild(card);
    });

    // slider
    const cards = Array.from(inner.children);
    let index = 0;
    function update() {
      if (!cards.length) return;
      const w = cards[0].getBoundingClientRect().width + 12; // includes gap
      const visible = Math.max(1, Math.floor(container.getBoundingClientRect().width / w));
      const maxIndex = Math.max(0, cards.length - visible);
      if (index > maxIndex) index = maxIndex;
      inner.style.transform = `translateX(${-(w * index)}px)`;
    }
    const prev = container.querySelector('#testi-prev');
    const next = container.querySelector('#testi-next');
    prev && prev.addEventListener('click', ()=> { index = Math.max(0,index-1); update(); });
    next && next.addEventListener('click', ()=> { index = Math.min(index+1, MANUAL_TESTIMONIALS.length-1); update(); });
    window.addEventListener('resize', throttle(update, 120));
    setTimeout(update, 80);

    // auto rotate (gentle)
    let auto = setInterval(()=>{ index = (index+1)%MANUAL_TESTIMONIALS.length; update(); }, 6000);
    container.addEventListener('mouseenter', ()=> clearInterval(auto));
    container.addEventListener('mouseleave', ()=> auto = setInterval(()=>{ index = (index+1)%MANUAL_TESTIMONIALS.length; update(); }, 6000));
  }

  // ---------- 3) Media Frame / Lightbox (non-invasive) ----------
  function initMediaFrames() {
    // Create modal if missing
    if (!$q('#scc-media-modal')) {
      const modal = document.createElement('div');
      modal.id = 'scc-media-modal';
      modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);z-index:9999;padding:18px;';
      modal.innerHTML = '<div id="scc-media-inner" style="max-width:1100px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;background:#000"></div><button id="scc-media-close" aria-label="close" style="position:fixed;right:24px;top:24px;z-index:10000;background:#fff;border-radius:999px;padding:8px;border:0;cursor:pointer">✕</button>';
      document.body.appendChild(modal);
      $q('#scc-media-close').addEventListener('click', ()=> { modal.style.display = 'none'; $q('#scc-media-inner').innerHTML = ''; document.body.style.overflow = ''; });
      modal.addEventListener('click', (ev)=> { if (ev.target === modal) { modal.style.display='none'; $q('#scc-media-inner').innerHTML=''; document.body.style.overflow=''; } });
    }

    const selectors = ['img.responsive-img','img[data-media="true"]','.gallery-item img','.video-poster'];
    const els = $qa(selectors.join(',')).filter(Boolean);

    els.forEach(el => {
      // skip if we've already wrapped
      if (el.dataset.sccWrapped === '1') return;
      el.dataset.sccWrapped = '1';
      // create wrapper but preserve original parent structure
      const wrapper = document.createElement('div');
      wrapper.className = 'scc-responsive-frame';
      wrapper.style.cursor = 'pointer';
      // copy computed styles for dimension preservation minimally
      wrapper.style.display = 'inline-block';
      wrapper.style.width = el.style.width || '100%';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);

      wrapper.addEventListener('click', () => {
        const src = el.getAttribute('data-full') || el.src || el.getAttribute('data-src');
        const video = el.getAttribute('data-video') || el.dataset.video;
        const modal = $q('#scc-media-modal');
        const inner = $q('#scc-media-inner');
        inner.innerHTML = '';
        if (video) {
          // youtube or mp4
          if (video.includes('youtube') || video.includes('youtu.be')) {
            let id = '';
            try {
              if (video.includes('youtu.be')) id = video.split('/').pop();
              else id = (new URL(video)).searchParams.get('v') || '';
            } catch(e){ id=''; }
            if (id) {
              inner.innerHTML = `<div style="position:relative;padding-top:56.25%"><iframe src="https://www.youtube.com/embed/${escapeHtml(id)}" frameborder="0" allowfullscreen style="position:absolute;left:0;top:0;width:100%;height:100%"></iframe></div>`;
            } else inner.textContent = 'Video cannot be loaded.';
          } else {
            inner.innerHTML = `<video controls playsinline style="width:100%;height:auto"><source src="${escapeHtml(video)}" type="video/mp4">Your browser does not support video.</video>`;
          }
        } else if (src) {
          inner.innerHTML = `<img src="${escapeHtml(src)}" style="width:100%;height:auto;display:block" alt="">`;
        } else {
          inner.textContent = 'Media not available.';
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ---------- Init on DOM ready ----------
  document.addEventListener('DOMContentLoaded', function () {
    try {
      // Step 1: contact form patch (won't override existing global modal)
      initContactFormPatch();

      // Step 2: replace live reviews with manual slider
      renderManualTestimonialsOnce();

      // Step 3: media frames
      initMediaFrames();

      console.info('site-core.js (conservative patch) initialized: form patch, testimonials, media frames.');
    } catch (err) {
      console.error('site-core patch error:', err);
    }
  });

  // Expose a safe helper so other scripts can trigger rendering if they create DOM later
  window._scc_renderManualTestimonials = renderManualTestimonialsOnce;
  window._scc_initMediaFrames = initMediaFrames;

})();
