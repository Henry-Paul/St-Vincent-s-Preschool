// js/site-core.js - consolidated site logic (burger, modals, testimonials, slider, resources, FAQ, WhatsApp fab)

/* --------------- EmailJS config (replace with real keys if needed) --------------- */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_14zrdg6',
  TEMPLATE_ID: 'template_snxhxlk',
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
};
if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY) {
  try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); } catch (e) { console.warn('EmailJS init error', e); }
}

/* ----- helpers ----- */
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ----- universal burger (works on all pages) ----- */
function initUniversalBurger(){
  $$('#menu-btn').forEach(btn=>{
    const header = btn.closest('header') || document;
    const mobileMenu = header.querySelector('#mobile-menu') || document.getElementById('mobile-menu');
    const setIcon = open => {
      btn.innerHTML = open ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    };
    setIcon(false);
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      if(!mobileMenu) return;
      const hidden = mobileMenu.classList.toggle('hidden');
      setIcon(!hidden);
      btn.setAttribute('aria-expanded', String(!hidden));
      if(!hidden){ const first = mobileMenu.querySelector('a,button,[tabindex]'); if(first) first.focus(); }
    });
    if(mobileMenu){
      mobileMenu.querySelectorAll('a').forEach(a=>{
        a.addEventListener('click', ev=>{
          mobileMenu.classList.add('hidden'); setIcon(false); btn.setAttribute('aria-expanded','false');
          const href = a.getAttribute('href');
          if(href && !href.startsWith('#') && !href.startsWith('javascript:')){
            ev.preventDefault();
            setTimeout(()=> window.location.href = href, 90);
          }
        });
      });
    }
  });
  document.addEventListener('click', ev=>{
    $$('#mobile-menu').forEach(menu=>{
      if(!menu.classList.contains('hidden') && !menu.contains(ev.target)){
        menu.classList.add('hidden');
        const header = menu.closest('header');
        const btn = header ? header.querySelector('#menu-btn') : document.getElementById('menu-btn');
        if(btn){ btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; btn.setAttribute('aria-expanded','false'); }
      }
    });
  });
  document.addEventListener('keydown', e=> { if(e.key==='Escape') $$('#mobile-menu').forEach(m=>m.classList.add('hidden')); });
}

/* ----- gallery slider ----- */
function initImageSlider(){
  const slider = document.getElementById('image-slider'); if(!slider) return;
  const slides = slider.querySelectorAll('.image-slide'); if(!slides.length) return;
  let idx = 0, total = slides.length;
  const prev = document.getElementById('slider-prev'), next = document.getElementById('slider-next');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  function update(){ slider.style.transform = `translateX(-${idx*100}%)`; dots.forEach((d,i)=> d.classList.toggle('active', i===idx)); }
  prev?.addEventListener('click', ()=> { idx=(idx-1+total)%total; update(); });
  next?.addEventListener('click', ()=> { idx=(idx+1)%total; update(); });
  dots.forEach(d=> d.addEventListener('click', e=> { idx=Number(e.currentTarget.dataset.index); update(); }));
  setInterval(()=> { idx=(idx+1)%total; update(); }, 6000);
  update();
}

/* ----- testimonials (render provided existing testimonials) ----- */
const TESTIMONIALS = [
  { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
  { name: "Latha B.", text: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning. The classrooms are modern and well-equipped. What truly stands out is how friendly and approachable the teachers are... One of the Best Schools in ChandaNagar" },
  { name: "Shashank Bhardwaj.", text: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing, and I've seen amazing growth in my little one's confidence and skills." },
  { name: "Saurabh Shourie.", text: "Great environment with lesser fees in comparison to other schools nearby . My child loves the school. Highly recommended.!" },
  { name: "Anita Singha.", text: "Recently my daughter joined school and she's very happy and she's hyperactive kid so, I am happy that school is very spacious , hygienic plus we got good experienced teachers as well" }
];
function renderTestimonials(){
  const c = document.getElementById('testimonials-grid'); if(!c) return;
  c.innerHTML = TESTIMONIALS.map((t,i)=> `
    <article class="testimonial-card bg-white p-6 rounded-2xl shadow-lg">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl text-yellow-600">★</div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">${escapeHtml(t.name)}</h3>
            <div class="text-yellow-500 text-lg font-bold">5.0</div>
          </div>
          <p class="mt-3 text-gray-600">${escapeHtml(t.text)}</p>
        </div>
      </div>
      <div class="mt-4 flex justify-end"><button class="px-4 py-2 bg-[--brand] text-white rounded open-contact-modal" data-program="Enquiry from testimonial ${i+1}">Enquire</button></div>
    </article>
  `).join('');
  // wire newly rendered buttons
  $$('.open-contact-modal').forEach(b=>{
    b.addEventListener('click', e => { openUnifiedModal({ prefillProgram: b.dataset.program || '' }); });
  });
}

/* ----- unified enquiry modal ----- */
function openUnifiedModal({ prefillProgram = '' } = {}){
  const existing = document.getElementById('sv-contact-modal'); if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'sv-contact-modal';
  overlay.className = 'fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-lg relative sv-modal-enter sv-modal-show" role="dialog" aria-modal="true">
      <button id="sv-close" class="absolute right-4 top-4 text-gray-600" aria-label="Close modal">✕</button>
      <h3 class="text-2xl font-bold mb-3">Schedule a Visit / Enquiry</h3>
      <form id="schedule-visit-form" class="space-y-3">
        <div><input type="text" id="user_name" name="user_name" placeholder="Your Name" required class="w-full p-3 border rounded" /></div>
        <div><input type="email" id="user_email" name="user_email" placeholder="Your Email" required class="w-full p-3 border rounded" /></div>
        <div><input type="tel" id="phone_number" name="phone_number" placeholder="Phone Number" required class="w-full p-3 border rounded" /></div>
        <div><input type="text" id="child_age" name="child_age" placeholder="Child's Age (e.g., 2.5 years)" required class="w-full p-3 border rounded" /></div>
        <div><label class="text-sm">Preferred Visit Date</label><input type="date" id="preferred_date" name="preferred_date" required class="w-full p-3 border rounded" /></div>
        <input type="hidden" id="program" name="program" value="${escapeHtml(prefillProgram || '')}" />
        <div class="flex gap-3">
          <button type="submit" class="btn-primary w-full">Send Request</button>
          <button type="button" id="sv-cancel" class="btn-primary-outline w-full">Cancel</button>
        </div>
        <p id="sv-result" class="text-center text-sm mt-2 hidden" role="status"></p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#sv-close').addEventListener('click', ()=> overlay.remove());
  overlay.querySelector('#sv-cancel').addEventListener('click', ()=> overlay.remove());
  document.addEventListener('keydown', e=> { if(e.key === 'Escape'){ const el=document.getElementById('sv-contact-modal'); if(el) el.remove(); } });

  overlay.querySelector('#schedule-visit-form').addEventListener('submit', function(e){
    e.preventDefault();
    const res = overlay.querySelector('#sv-result'); res.classList.remove('hidden'); res.textContent='Sending...';
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
    if(window.emailjs && EMAILJS_CONFIG.SERVICE_ID){
      emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, payload)
        .then(()=> { res.textContent='Thanks — we will contact you shortly.'; setTimeout(()=> overlay.remove(), 1100); })
        .catch(err=> { console.error('EmailJS error', err); res.textContent='Submission failed — please call +91 9032249494'; });
    } else {
      setTimeout(()=> { res.textContent='Thanks — we will contact you shortly.'; setTimeout(()=> overlay.remove(), 900); }, 900);
    }
  });
}

/* ----- resource modals content ----- */
const RESOURCE_CONTENT = {
  "early-learning": {
    title: "The Science of Early Learning",
    image: "images/resources/early-learning.jpg",
    html: `
      <p>The early years are a critical period for brain development. Preschool experiences influence neural pathways responsible for language, social skills, and executive function.</p>
      <h4 class="mt-4 font-semibold">What we focus on</h4>
      <ul class="list-disc pl-5 mt-2">
        <li>Language-rich interactions and story-based learning</li>
        <li>Play-based activities that strengthen attention and memory</li>
        <li>Opportunities for exploration to build curiosity and confidence</li>
      </ul>
      <p class="mt-3">Our teachers scaffold learning to ensure each child experiences success and joyful discovery.</p>
    `
  },
  "social-skills": {
    title: "Social Skills Development",
    image: "images/resources/social-skills.jpg",
    html: `
      <p>Preschool is where children learn to share, cooperate, and express emotions positively. Peer interactions and guided group activities build empathy and communication.</p>
      <h4 class="mt-4 font-semibold">How we support social growth</h4>
      <ul class="list-disc pl-5 mt-2">
        <li>Structured group play and turn-taking games</li>
        <li>Emotion coaching and language for feelings</li>
        <li>Conflict resolution modeled by teachers</li>
      </ul>
    `
  },
  "primary-school": {
    title: "Preparing for Primary School",
    image: "images/resources/primary-school.jpg",
    html: `
      <p>Transitioning to primary school is smoother when children have early practice with routines, basic literacy and numeracy, and confidence in group learning.</p>
      <h4 class="mt-4 font-semibold">Key preparation areas</h4>
      <ul class="list-disc pl-5 mt-2">
        <li>Independence & self-help skills</li>
        <li>Following multi-step instructions and classroom routines</li>
        <li>Foundational literacy and numeracy concepts</li>
      </ul>
      <p class="mt-3">We partner with parents to scaffold these skills so each child begins primary school ready and confident.</p>
    `
  }
};

function openResourceModal(key){
  const data = RESOURCE_CONTENT[key]; if(!data) return;
  const existing = document.getElementById('resource-modal'); if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id='resource-modal';
  overlay.className='fixed inset-0 z-70 flex items-start justify-center bg-black/60 p-4';
  overlay.innerHTML = `
    <div class="bg-white rounded-xl w-full max-w-2xl overflow-hidden sv-modal-enter sv-modal-show" role="dialog" aria-modal="true">
      <div style="height:220px; background:url('${data.image}') center/cover no-repeat"></div>
      <div class="p-6">
        <div class="flex justify-between">
          <h3 class="text-2xl font-bold">${escapeHtml(data.title)}</h3>
          <button id="resource-close" class="text-gray-600" aria-label="Close resource modal">✕</button>
        </div>
        <div class="mt-4 text-gray-700">${data.html}</div>
        <div class="mt-6 flex gap-3">
          <button class="btn-primary open-contact-modal" data-program="${escapeHtml(data.title)}">Schedule a Visit</button>
          <a class="btn-primary-outline" href="tel:+919032249494">Call +91 9032249494</a>
          <a class="btn-primary-outline" href="https://wa.me/919032249494" target="_blank" rel="noopener">Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#resource-close').addEventListener('click', ()=> overlay.remove());
  document.addEventListener('keydown', e=> { if(e.key==='Escape'){ const el=document.getElementById('resource-modal'); if(el) el.remove(); } });
  overlay.querySelectorAll('.open-contact-modal').forEach(b => b.addEventListener('click', ()=> openUnifiedModal({ prefillProgram: b.dataset.program || '' })));
}

/* ----- wire resource buttons ----- */
function wireResourceButtons(){
  $$('[data-resource]').forEach(b => b.addEventListener('click', e => openResourceModal(e.currentTarget.dataset.resource)));
}

/* ----- FAQ accordion with + / - ----- */
function initFAQAccordion(){
  $$('.faq-q').forEach(q=>{
    q.addEventListener('click', ()=>{
      const expanded = q.getAttribute('aria-expanded') === 'true';
      const a = q.parentElement.querySelector('.faq-a');
      const sign = q.querySelector('.sign');
      if(!a) return;
      if(expanded){
        a.style.maxHeight = '0';
        q.setAttribute('aria-expanded','false');
        if(sign) sign.textContent = '+';
      } else {
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded','true');
        if(sign) sign.textContent = '−';
      }
    });
  });
}

/* ----- WhatsApp floating button ----- */
function initWhatsAppFab(){
  if(document.getElementById('whatsapp-fab-global')) return;
  const phone = '919032249494';
  const text = encodeURIComponent("Hello, I am interested in St. Vincent's Preschool programs.");
  const url = `https://wa.me/${phone}?text=${text}`;

  const wrapper = document.createElement('div');
  wrapper.style.position='fixed';
  wrapper.style.right='1.5rem';
  wrapper.style.bottom='1.5rem';
  wrapper.style.zIndex='80';
  wrapper.className='whatsapp-wrapper';

  const a = document.createElement('a');
  a.id='whatsapp-fab-global';
  a.href=url;
  a.target='_blank';
  a.rel='noopener';
  a.style.width='56px';
  a.style.height='56px';
  a.style.background='#25D366';
  a.style.display='flex';
  a.style.alignItems='center';
  a.style.justifyContent='center';
  a.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)';
  a.style.borderRadius='999px';
  a.setAttribute('aria-label','Chat on WhatsApp');
  a.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.15-.198.297-.768.966-.942 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.151-.173.2-.298.3-.497.1-.198.05-.372-.025-.52-.074-.149-.672-1.618-.922-2.214-.243-.579-.49-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.064 2.876 1.212 3.074c.149.198 2.095 3.2 5.077 4.487  .709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.273-.198-.57-.347z" fill="white"/></svg>`;

  const tip = document.createElement('div');
  tip.style.position='absolute';
  tip.style.right='70px';
  tip.style.bottom='10px';
  tip.style.background='rgba(31,31,31,0.92)';
  tip.style.color='#fff';
  tip.style.padding='6px 10px';
  tip.style.borderRadius='8px';
  tip.style.fontSize='13px';
  tip.style.boxShadow='0 8px 20px rgba(0,0,0,0.12)';
  tip.style.opacity='0';
  tip.style.transform='translateY(6px)';
  tip.style.transition='opacity .28s, transform .28s';
  tip.textContent='Chat with us on WhatsApp';

  wrapper.appendChild(a);
  wrapper.appendChild(tip);
  document.body.appendChild(wrapper);
  setTimeout(()=> { tip.style.opacity='1'; tip.style.transform='translateY(0)'; }, 1200);
  setTimeout(()=> { tip.style.opacity='0'; tip.style.transform='translateY(6px)'; }, 6500);
  a.addEventListener('mouseenter', ()=> { tip.style.opacity='1'; tip.style.transform='translateY(0)'; });
  a.addEventListener('mouseleave', ()=> { tip.style.opacity='0'; tip.style.transform='translateY(6px)'; });
}

/* ----- wire global CTAs ----- */
function wireGlobalCTAs(){
  $$('.open-contact-modal').forEach(btn=>{
    btn.addEventListener('click', e=> openUnifiedModal({ prefillProgram: btn.dataset.program || '' }));
  });
  const mainBtn = document.getElementById('schedule-visit-btn-main'); if(mainBtn) mainBtn.addEventListener('click', ()=> openUnifiedModal({}));
}

/* ----- init everything ----- */
document.addEventListener('DOMContentLoaded', ()=>{
  initUniversalBurger();
  initImageSlider();
  renderTestimonials();
  wireResourceButtons();
  wireGlobalCTAs();
  initFAQAccordion();
  initWhatsAppFab();

  // Accessibility: enable focus trap for modals could be added later if required
});
