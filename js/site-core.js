// js/site-core.js - consolidated site logic (burger, modals, testimonials, slider, emailjs)

/* EMAILJS CONFIG — using values from your uploaded file */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_14zrdg6',
  TEMPLATE_ID: 'template_snxhxlk',
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
};

/* Initialize EmailJS if available */
if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY) {
  try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch (e) { console.warn('EmailJS init failed', e); }
}

/* DOM helpers */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));

/* ----------------- Universal burger/mobile menu ----------------- */
function initUniversalBurger() {
  // select any menu buttons on the page (support id or class)
  const buttons = Array.from(document.querySelectorAll('[id="menu-btn"], .menu-btn'));
  buttons.forEach(btn => {
    const header = btn.closest('header') || document;
    const mobileMenu = header.querySelector('#mobile-menu') || document.getElementById('mobile-menu');
    function setIcon(open) {
      if (btn.dataset.customIcon) return;
      btn.innerHTML = open ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    setIcon(false);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!mobileMenu) return;
      const isHidden = mobileMenu.classList.toggle('hidden');
      setIcon(!isHidden);
      btn.setAttribute('aria-expanded', String(!isHidden));
      if (!isHidden) {
        const first = mobileMenu.querySelector('a, button, [tabindex]') || null;
        if (first) first.focus();
      }
    });

    // Ensure links inside mobile menu close menu and navigate
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (ev) => {
          mobileMenu.classList.add('hidden');
          setIcon(false);
          btn.setAttribute('aria-expanded','false');
          const href = a.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            ev.preventDefault();
            setTimeout(() => { window.location.href = href; }, 90);
          }
        });
      });
    }
  });

  // click outside to close
  document.addEventListener('click', (ev) => {
    $$('#mobile-menu').forEach(menu => {
      if (!menu.classList.contains('hidden') && !menu.contains(ev.target)) {
        menu.classList.add('hidden');
        const header = menu.closest('header');
        const btn = header ? header.querySelector('[id="menu-btn"], .menu-btn') : document.querySelector('[id="menu-btn"], .menu-btn');
        if (btn) { btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; btn.setAttribute('aria-expanded','false'); }
      }
    });
  });

  // ESC closes mobile menus
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('#mobile-menu').forEach(m => m.classList.add('hidden')); } });
}

/* ------------------ Static testimonials (top 5) ------------------ */
const STATIC_TESTIMONIALS = [
  { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
  { name: "Latha B.", text: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning. The classrooms are modern and well-equipped. What truly stands out is how friendly and approachable the teachers are... One of the Best Schools in ChandaNagar" },
  { name: "Shashank Bhardwaj.", text: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing, and I've seen amazing growth in my little one's confidence and skills." },
  { name: "Saurabh Shourie.", text: "Great environment with lesser fees in comparison to other schools nearby . My child loves the school. Highly recommended.!" },
  { name: "Anita Singha.", text: "Recently my daughter joined school and she's very happy and she's hyperactive kid so, I am happy that school is very spacious , hygienic plus we got good experienced teachers as well" }
];

function renderTestimonialsGrid() {
  const container = document.getElementById('testimonials-grid') || document.getElementById('testimonials-inner') || document.querySelector('.testimonials');
  if (!container) return;
  container.innerHTML = STATIC_TESTIMONIALS.slice(0,5).map((t, i) => `
    <article class="testimonial-card bg-white p-6 rounded-2xl shadow-lg">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl text-yellow-600">★</div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">${escapeHtml(t.name)}</h3>
            <div class="text-yellow-500 text-lg font-bold">5.0</div>
          </div>
          <p class="mt-3 text-gray-600">${escapeHtml(t.text.length>240? t.text.slice(0,240) + '...' : t.text)}</p>
        </div>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <div class="text-xs text-gray-500">Verified Google Review</div>
        <button class="testimonial-enquire btn-small" data-index="${i}">Enquire</button>
      </div>
    </article>
  `).join('');
  $$('.testimonial-enquire').forEach(b => b.addEventListener('click', () => openUnifiedModal({})));
}

/* ------------------ Program details content ------------------ */
const PROGRAM_DETAILS = {
  playgroup: { title: 'Playgroup (1.5–2.5 yrs)', content: `<p>Gentle settling, sensory exploration and early social skills. Teacher ratio 1:6. Sample day includes free play, snack, storytime and nap.</p><ul class="mt-3 list-disc pl-5 text-sm text-gray-600"><li>Routine-focused settling</li><li>Sensory stations</li><li>Daily parent notes</li></ul>` },
  nursery: { title: 'Nursery (2.5–3.5 yrs)', content: `<p>Foundational literacy & numeracy through play. Teacher ratio 1:8. Activities include phonics, counting games and craft.</p>` },
  lkg: { title: 'Pre-Primary 1 (PP1)', content: `<p>Pre-writing, phonemic awareness and readiness skills for formal schooling. Focus on fine motor & letter formation.</p>` },
  ukg: { title: 'Pre-Primary 2 (PP2)', content: `<p>Reading fluency, basic arithmetic and independence readiness for Grade 1.</p>` },
  daycare: { title: 'Day Care', content: `<p>Extended care including meals, rest, and supervised activities. Emphasis on safety and consistent routines.</p>` }
};

function openProgramModal(key) {
  const data = PROGRAM_DETAILS[key] || { title: 'Program Details', content: '<p>Details coming soon.</p>' };
  const id = 'program-modal';
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-2xl relative">
      <button class="absolute right-4 top-4 text-gray-600" onclick="document.getElementById('${id}').remove()">✕</button>
      <h3 class="text-2xl font-bold mb-3">${data.title}</h3>
      <div class="text-gray-700">${data.content}</div>
      <div class="mt-4 flex gap-3">
        <button class="btn-primary open-contact-modal" data-program="${key}">Enquire Now</button>
        <button class="btn-primary-outline" onclick="document.getElementById('${id}').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ------------------ Unified enquiry form/modal (using uploaded field names) ------------------ */
function openUnifiedModal({ prefillProgram = '' } = {}) {
  const existing = document.getElementById('sv-contact-modal'); if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'sv-contact-modal';
  overlay.className = 'fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-lg relative">
      <button id="sv-close" class="absolute right-4 top-4 text-gray-600">✕</button>
      <h3 class="text-2xl font-bold mb-3">Schedule a Visit / Enquiry</h3>
      <form id="schedule-visit-form" class="space-y-3">
        <div><input type="text" id="user_name" name="user_name" placeholder="Your Name" required class="w-full p-3 border rounded" /></div>
        <div><input type="email" id="user_email" name="user_email" placeholder="Your Email" required class="w-full p-3 border rounded" /></div>
        <div><input type="tel" id="phone_number" name="phone_number" placeholder="Phone Number" required class="w-full p-3 border rounded" /></div>
        <div><input type="text" id="child_age" name="child_age" placeholder="Child's Age (e.g., 2.5 years)" required class="w-full p-3 border rounded" /></div>
        <div><label class="text-sm">Preferred Visit Date</label><input type="date" id="preferred_date" name="preferred_date" required class="w-full p-3 border rounded" /></div>
        <input type="hidden" id="program" name="program" value="" />
        <div class="flex gap-3">
          <button type="submit" class="btn-primary w-full">Send Request</button>
          <button type="button" id="sv-cancel" class="btn-primary-outline w-full">Cancel</button>
        </div>
        <p id="sv-result" class="text-center text-sm mt-2 hidden"></p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  // prefill program if provided
  if (prefillProgram) { const sel = overlay.querySelector('#program'); if (sel) sel.value = prefillProgram; }

  overlay.querySelector('#sv-close').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#sv-cancel').addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const el = document.getElementById('sv-contact-modal'); if (el) el.remove(); } });

  // form submit handler
  overlay.querySelector('#schedule-visit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const res = overlay.querySelector('#sv-result'); res.classList.remove('hidden'); res.textContent = 'Sending...';
    const form = e.target;
    const payload = {
      user_name: form.user_name.value,
      user_email: form.user_email.value,
      phone_number: form.phone_number.value,
      child_age: form.child_age.value,
      preferred_date: form.preferred_date.value,
      program: form.program.value,
      timestamp: new Date().toLocaleString()
    };
    if (window.emailjs && EMAILJS_CONFIG.SERVICE_ID) {
      emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload)
        .then(() => { res.textContent = 'Thanks — we will contact you shortly.'; setTimeout(() => overlay.remove(), 1200); })
        .catch(err => { console.error('EmailJS error', err); res.textContent = 'Submission failed — please call +91 9032249494'; });
    } else {
      setTimeout(() => { res.textContent = 'Thanks — we will contact you shortly.'; setTimeout(() => overlay.remove(), 900); }, 900);
    }
  });
}

/* ------------------ FAQ accordion wiring ------------------ */
function initFAQAccordion() {
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const expanded = q.getAttribute('aria-expanded') === 'true';
      const a = q.parentElement.querySelector('.faq-a');
      if (!a) return;
      if (expanded) {
        a.style.maxHeight = '0';
        q.setAttribute('aria-expanded','false');
      } else {
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });
}

/* ------------------ gallery slider ------------------ */
function initImageSlider() {
  const slider = document.getElementById('image-slider'); if (!slider) return;
  const slides = slider.querySelectorAll('.image-slide'); if (!slides.length) return;
  let idx = 0, total = slides.length;
  const prev = document.getElementById('slider-prev'), next = document.getElementById('slider-next');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  function update(){ slider.style.transform = `translateX(-${idx*100}%)`; dots.forEach((d,i)=> d.classList.toggle('active', i===idx)); }
  prev?.addEventListener('click', ()=> { idx=(idx-1+total)%total; update(); });
  next?.addEventListener('click', ()=> { idx=(idx+1)%total; update(); });
  dots.forEach(d => d.addEventListener('click', e => { idx = Number(e.currentTarget.dataset.index); update(); }));
  setInterval(()=> { idx=(idx+1)%total; update(); }, 6000);
  update();
}

/* ------------------ wire global triggers ------------------ */
function wireGlobalTriggers() {
  $$('.open-program-details').forEach(btn => btn.addEventListener('click', () => openProgramModal(btn.dataset.program || '')));
  $$('.open-contact-modal').forEach(btn => btn.addEventListener('click', (e) => {
    const p = btn.dataset.program || '';
    openUnifiedModal({ prefillProgram: p });
  }));
  const mainBtn = document.getElementById('schedule-visit-btn-main'); if (mainBtn) mainBtn.addEventListener('click', () => openUnifiedModal({}));
}

/* ------------------ helpers ------------------ */
function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ------------------ init ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initUniversalBurger();
  renderTestimonialsGrid();
  initImageSlider();
  initFAQAccordion();
  wireGlobalTriggers();
});
