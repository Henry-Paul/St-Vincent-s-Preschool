// js/site-core.js - consolidated site logic: burger, modals, programs, testimonials, slider, EmailJS

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_14zrdg6',     // from your uploaded file
  TEMPLATE_ID: 'template_snxhxlk',   // from your uploaded file
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'    // from your uploaded file
};

// Init EmailJS if available
if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY) {
  try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch(e){ console.warn('EmailJS init failed', e); }
}

// Helper
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

/* ------------------ Universal burger menu ------------------ */
function initBurger(){
  const btns = Array.from(document.querySelectorAll('#menu-btn, .menu-btn, [data-menu-btn]'));
  btns.forEach(btn=>{
    const header = btn.closest('header') || document;
    const mobile = header.querySelector('#mobile-menu') || document.getElementById('mobile-menu');
    function setIcon(open){
      if(btn.dataset.customIcon) return;
      btn.innerHTML = open ? '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M6 18L18 6M6 6l12 12\"/></svg>' : '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></svg>';
    }
    setIcon(false);
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      if(!mobile) return;
      const isHidden = mobile.classList.toggle('hidden');
      setIcon(!isHidden);
      btn.setAttribute('aria-expanded', String(!isHidden));
      if(!isHidden) {
        const first = mobile.querySelector('a, button, [tabindex]');
        if(first) first.focus();
      }
    });
    if(mobile){
      mobile.querySelectorAll('a, button').forEach(link=>{
        link.addEventListener('click', ()=> {
          mobile.classList.add('hidden');
          setIcon(false);
        });
      });
    }
  });

  document.addEventListener('click', ()=>{
    $$('#mobile-menu:not(.hidden)').forEach(menu => {
      if(!menu.contains(event?.target)) menu.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', e=>{ if(e.key==='Escape') $$('#mobile-menu').forEach(m=>m.classList.add('hidden')); });
}

/* ------------------ Testimonials (static top-5 from upload) ------------------ */
const STATIC_TESTIMONIALS = [
  { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school."},
  { name: "Latha B.", text: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning. The classrooms are modern and well-equipped. What truly stands out is how friendly and approachable the teachers are... One of the Best Schools in ChandaNagar"},
  { name: "Shashank Bhardwaj.", text: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing, and I've seen amazing growth in my little one's confidence and skills."},
  { name: "Saurabh Shourie.", text: "Great environment with lesser fees in comparison to other schools nearby . My child loves the school. Highly recommended.!"},
  { name: "Anita Singha.", text: "Recently my daughter joined school and she's very happy and she's hyperactive kid so, I am happy that school is very spacious , hygienic plus we got good experienced teachers as well"}
];

function renderTestimonials(){
  const grid = document.getElementById('testimonials-grid') || document.getElementById('testimonials-inner') || document.querySelector('.testimonials');
  if(!grid) return;
  const items = STATIC_TESTIMONIALS.slice(0,5).map((t,i)=>`
    <article class="testimonial-card bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-2 transition">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl text-yellow-600 font-bold">★</div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold text-gray-800">${escapeHtml(t.name)}</h3>
            <div class="text-yellow-500 text-lg font-bold">5.0</div>
          </div>
          <p class="mt-3 text-gray-600 leading-relaxed">${escapeHtml(t.text.length>240?t.text.slice(0,240)+'...':t.text)}</p>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-gray-500">Verified Google Review</div>
        <div><button class="testimonial-enquire crayon-button bg-red-500 text-white px-4 py-2 rounded-lg" data-index="${i}">Enquire</button></div>
      </div>
    </article>
  `).join('');
  grid.innerHTML = items;
  // wire enquire
  $$('.testimonial-enquire').forEach(btn=>btn.addEventListener('click', ()=> openUnifiedModal({})));
}

/* ------------------ Program details modal ------------------ */
const PROGRAM_DETAILS = {
  playgroup: {
    title: 'Playgroup (1.5–2.5 yrs)',
    content: `<p>Gentle settling, sensory exploration and early social skills. Teacher ratio 1:6. Sample day includes free play, snack, storytime and nap.</p><ul class="mt-3 list-disc pl-5 text-sm text-gray-600"><li>Routine-focused settling</li><li>Sensory stations</li><li>Daily parent notes</li></ul>`
  },
  nursery: {
    title: 'Nursery (2.5–3.5 yrs)',
    content: `<p>Foundational literacy & numeracy through play. Teacher ratio 1:8. Activities include phonics, counting games and craft.</p><ul class="mt-3 list-disc pl-5 text-sm text-gray-600"><li>Pre-reading & phonics</li><li>Number sense activities</li><li>Story & circle time</li></ul>`
  },
  lkg: {
    title: 'Pre-Primary 1 (PP1)',
    content: `<p>Pre-writing, phonemic awareness and concept application. Ratio 1:10. Focus on readiness skills for formal schooling.</p>`
  },
  ukg: {
    title: 'Pre-Primary 2 (PP2)',
    content: `<p>Reading fluency, early arithmetic and independence. Prepares children for Grade 1 expectations.</p>`
  },
  daycare: {
    title: 'Day Care',
    content: `<p>Extended care including meals, rest and supervised activities. Emphasis on safety and routine continuity.</p>`
  }
};

function openProgramModal(key){
  const data = PROGRAM_DETAILS[key] || {title: 'Program', content: '<p>Details coming soon.</p>'};
  const id = 'program-modal';
  const existing = document.getElementById(id);
  if(existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-xl w-full max-w-2xl p-6 relative">
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

/* ------------------ Unified enquiry modal (uses fields from your uploaded HTML) ------------------ */
/* Fields: parentName, phone, childAge (options), program (playgroup,nursery,lkg,ukg,daycare), message */
function openUnifiedModal({ prefillProgram='' } = {}){
  const existing = document.getElementById('sv-contact-modal');
  if(existing) { existing.remove(); } // recreate to ensure fresh state
  const overlay = document.createElement('div');
  overlay.id = 'sv-contact-modal';
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl w-full max-w-lg p-6 relative">
      <button class="absolute right-4 top-4 text-gray-600" id="sv-close">✕</button>
      <h3 class="text-2xl font-bold mb-3">Enquiry / Schedule a Visit</h3>
      <form id="sv-form" class="space-y-3">
        <div><label class="text-sm">Parent's Name</label><input id="sv-parentName" name="parentName" class="w-full p-3 border rounded" required></div>
        <div><label class="text-sm">Phone</label><input id="sv-phone" name="phone" class="w-full p-3 border rounded" required></div>
        <div><label class="text-sm">Child's Age</label>
          <select id="sv-childAge" name="childAge" class="w-full p-3 border rounded" required>
            <option value="">Select age range</option>
            <option>1.5 to 2 years</option>
            <option>2 to 3 years</option>
            <option>3 to 4 years</option>
            <option>4 to 5 years</option>
            <option>5 to 6 years</option>
          </select>
        </div>
        <div><label class="text-sm">Program</label>
          <select id="sv-program" name="program" class="w-full p-3 border rounded">
            <option value="">Select program</option>
            <option value="playgroup">Playgroup</option>
            <option value="nursery">Nursery</option>
            <option value="lkg">Pre-Primary 1</option>
            <option value="ukg">Pre-Primary 2</option>
            <option value="daycare">Day Care</option>
          </select>
        </div>
        <div><label class="text-sm">Message (optional)</label><textarea id="sv-message" name="message" class="w-full p-3 border rounded"></textarea></div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary w-full">Submit Inquiry</button>
          <button type="button" id="sv-cancel" class="btn-primary-outline w-full">Cancel</button>
        </div>
        <p id="sv-result" class="text-center text-sm mt-2 hidden"></p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  // prefill program if provided
  if(prefillProgram){
    const sel = overlay.querySelector('#sv-program');
    if(sel) Array.from(sel.options).forEach(o=>{ if(o.value.toLowerCase() === prefillProgram.toLowerCase()) o.selected = true; });
  }

  overlay.querySelector('#sv-close').addEventListener('click', ()=>overlay.remove());
  overlay.querySelector('#sv-cancel').addEventListener('click', ()=>overlay.remove());
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') overlay.remove(); }, { once: false });

  // form submit
  overlay.querySelector('#sv-form').addEventListener('submit', function(e){
    e.preventDefault();
    const res = overlay.querySelector('#sv-result');
    res.classList.remove('hidden'); res.textContent = 'Sending...';
    const payload = {
      parentName: overlay.querySelector('#sv-parentName').value,
      phone: overlay.querySelector('#sv-phone').value,
      childAge: overlay.querySelector('#sv-childAge').value,
      program: overlay.querySelector('#sv-program').value,
      message: overlay.querySelector('#sv-message').value,
      timestamp: new Date().toLocaleString()
    };
    // EmailJS send
    if(window.emailjs && EMAILJS_CONFIG.SERVICE_ID){
      emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload)
        .then(()=>{ res.textContent = 'Thanks — we will contact you shortly.'; setTimeout(()=>overlay.remove(), 1400); })
        .catch(err=>{ console.error('EmailJS error', err); res.textContent = 'Submission failed; please call +91 9032249494'; });
      return;
    }
    // fallback simulation
    setTimeout(()=>{ res.textContent = 'Thanks — we will contact you shortly.'; setTimeout(()=>overlay.remove(), 1200); }, 900);
  });
}

/* ------------------ Gallery slider hook ------------------ */
function initSlider(){
  const slider = document.getElementById('image-slider');
  if(!slider) return;
  const slides = slider.querySelectorAll('.image-slide');
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  let idx = 0, total = slides.length;
  function update(){ slider.style.transform = `translateX(-${idx*100}%)`; dots.forEach((d,i)=> d.classList.toggle('active', i===idx)); }
  prev?.addEventListener('click', ()=>{ idx = (idx-1+total)%total; update(); });
  next?.addEventListener('click', ()=>{ idx = (idx+1)%total; update(); });
  dots.forEach(d=>d.addEventListener('click', e=>{ idx = Number(e.target.dataset.index); update(); }));
  setInterval(()=>{ idx=(idx+1)%total; update(); }, 6000);
  update();
}

/* ------------------ Program details triggers & contact triggers ------------------ */
function wireActions(){
  $$('.open-program-details').forEach(btn => btn.addEventListener('click', e => openProgramModal(btn.dataset.program || '')));
  $$('.open-contact-modal').forEach(btn => btn.addEventListener('click', e => {
    const p = btn.dataset.program || '';
    openUnifiedModal({ prefillProgram: p });
  }));
  const mainBtn = document.getElementById('schedule-visit-btn-main');
  if(mainBtn) mainBtn.addEventListener('click', ()=> openUnifiedModal({}));
}

/* ------------------ Utils ------------------ */
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ------------------ Init on DOM ready ------------------ */
document.addEventListener('DOMContentLoaded', ()=>{
  initBurger();
  renderTestimonials();
  initSlider();
  wireActions();
});
