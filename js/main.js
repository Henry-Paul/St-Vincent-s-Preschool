// js/main.js - collects menu toggle, modal, contact form (EmailJS), slider, program modal, map init, and small UX bits

const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_14zrdg6',
    TEMPLATE_ID: 'template_snxhxlk',
    PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
  },
  PLACE_ID: 'YOUR_PLACE_ID_HERE', // optional
  WHATSAPP_NUMBER: '919032249494'
};

/* Initialize EmailJS */
if(window.emailjs) { try{ emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY); }catch(e){ console.warn('EmailJS init error', e); } }

/* helpers */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* Back button behavior */
$$('#back-btn').forEach(b => b.addEventListener('click', ()=> { if(document.referrer) history.back(); else location.href='index.html'; }));

/* Menu toggle with icon swap */
(function menuSetup(){
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if(!menuBtn) return;
  function setIcon(open){
    menuBtn.innerHTML = open
      ? '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M6 18L18 6M6 6l12 12\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>'
      : '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M4 6h16M4 12h16M4 18h16\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>';
  }
  setIcon(false);
  menuBtn.addEventListener('click', ()=> {
    const isHidden = mobileMenu.classList.contains('hidden');
    if(mobileMenu) mobileMenu.classList.toggle('hidden');
    setIcon(isHidden);
    menuBtn.setAttribute('aria-expanded', String(isHidden));
  });
})();

/* Modal open/close */
document.addEventListener('click', (e) => {
  const open = e.target.closest('.open-contact-modal, [data-open-modal]');
  if(open){
    const program = open.dataset.program || '';
    const modal = document.getElementById('contact-modal');
    if(modal){
      // prefill program if select exists
      const programSelect = modal.querySelector('select[name="program"]') || document.querySelector('select[name="program"]');
      if(programSelect && program) {
        // try matching option values (case-insensitive)
        Array.from(programSelect.options).forEach(opt => {
          if(opt.value.toLowerCase() === program.toLowerCase()) opt.selected = true;
        });
      }
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
  const close = e.target.closest('[data-close-modal]');
  if(close){
    const modal = close.closest('.modal');
    if(modal){ modal.classList.add('hidden'); document.body.style.overflow = ''; }
  }
});

/* Close modal on Esc */
document.addEventListener('keydown', (e) => { if(e.key === 'Escape'){ document.querySelectorAll('.modal').forEach(m=> m.classList.add('hidden')); document.body.style.overflow=''; } });

/* Contact form handling (EmailJS) - supports multiple #contact-form instances on page */
(function contactFormSetup(){
  Array.from(document.querySelectorAll('#contact-form')).forEach(form => {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const successEl = form.querySelector('#contact-form-success-message') || $('#contact-form-success-message');
      const errorEl = form.querySelector('#contact-form-error-message') || $('#contact-form-error-message');
      if(successEl) successEl.classList.add('hidden');
      if(errorEl) errorEl.classList.add('hidden');

      const parentName = form.querySelector('[name="parentName"]')?.value || '';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const childAge = form.querySelector('[name="childAge"]')?.value || '';
      const program = form.querySelector('[name="program"]')?.value || '';
      const message = form.querySelector('[name="message"]')?.value || '';

      if(!parentName || !phone){
        if(errorEl){ errorEl.textContent = 'Please enter name and phone.'; errorEl.classList.remove('hidden'); }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const submitText = form.querySelector('#submit-text');
      const spinner = form.querySelector('#submit-spinner');

      if(btn) btn.disabled = true;
      if(submitText) submitText.textContent = 'Sending...';
      if(spinner) spinner.classList.remove('hidden');

      const payload = { parentName, phone, childAge, program, message, timestamp: new Date().toLocaleString() };

      emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, payload)
        .then(() => {
          if(successEl){ successEl.classList.remove('hidden'); successEl.textContent = 'Thanks — we will contact you shortly.'; }
          form.reset();
          if(btn) btn.disabled = false;
          if(submitText) submitText.textContent = 'Submit Inquiry';
          if(spinner) spinner.classList.add('hidden');
          // close modal if present
          const modal = form.closest('.modal');
          if(modal){ setTimeout(()=>{ modal.classList.add('hidden'); document.body.style.overflow=''; }, 1200); }
        })
        .catch(err => {
          console.error('EmailJS error', err);
          if(errorEl){ errorEl.classList.remove('hidden'); errorEl.textContent = 'Unable to send; try again later.'; }
          if(btn) btn.disabled = false;
          if(submitText) submitText.textContent = 'Submit Inquiry';
          if(spinner) spinner.classList.add('hidden');
        });
    });
  });
})();

/* Gallery slider */
(function sliderSetup(){
  const slider = document.getElementById('image-slider');
  if(!slider) return;
  const slides = slider.querySelectorAll('.image-slide');
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  let idx = 0, total = slides.length;
  function update(){ slider.style.transform = `translateX(-${idx*100}%)`; dots.forEach((d,i)=> d.classList.toggle('active', i===idx)); }
  prev?.addEventListener('click', ()=>{ idx = (idx-1+total) % total; update(); });
  next?.addEventListener('click', ()=>{ idx = (idx+1) % total; update(); });
  dots.forEach(d => d.addEventListener('click', e => { idx = Number(e.target.dataset.index); update(); }));
  setInterval(()=>{ idx = (idx+1) % total; update(); }, 6000);
  update();
})();

/* Program details modal & prefill */
(function programDetails(){
  document.querySelectorAll('.open-program-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const program = btn.dataset.program || 'Program';
      const html = `
        <div class="program-modal fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div class="bg-white p-6 rounded-xl max-w-2xl w-full mx-4">
            <button class="close-program-modal float-right text-gray-600">✕</button>
            <h3 class="text-2xl font-bold mb-2">${program}</h3>
            <p class="text-gray-700 mb-4">Comprehensive information about ${program}: curriculum, timings, teacher ratio, sample day, fees, FAQs and enrollment steps.</p>
            <div class="flex gap-3">
              <button class="btn-primary enquire-from-program" data-program="${program}">Enquire Now</button>
              <button class="btn-primary-outline close-program-modal">Close</button>
            </div>
          </div>
        </div>`;
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      document.body.appendChild(wrap);

      wrap.querySelectorAll('.close-program-modal').forEach(x => x.addEventListener('click', ()=>wrap.remove()));
      wrap.querySelector('.enquire-from-program').addEventListener('click', (e) => {
        const programVal = e.currentTarget.dataset.program;
        wrap.remove();
        const modal = document.getElementById('contact-modal');
        if(modal){ modal.classList.remove('hidden'); document.body.style.overflow='hidden'; setTimeout(()=> {
          const programSelect = document.querySelector('#contact-modal select[name="program"], #contact-form select[name="program"]');
          if(programSelect) {
            Array.from(programSelect.options).forEach(opt => {
              if(opt.value.toLowerCase() === programVal.toLowerCase()) opt.selected = true;
            });
          }
        }, 120); }
      });
    });
  });
})();

/* WhatsApp (the fab is just a link to wa.me) - small extra: suggestions (if panel implemented) */
(function whatsapp(){
  // nothing else necessary: link opens whatsapp in new tab
})();

/* Google Maps init (used on contact page; reviews on home optional) */
function initMap(){
  const mapEl = document.getElementById('map');
  if(!mapEl) return;
  const center = { lat: 17.4447, lng: 78.3432 };
  const map = new google.maps.Map(mapEl, { center, zoom: 16 });
  const marker = new google.maps.Marker({ position: center, map });
  // If you want reviews on home: use PlacesService to getDetails with CONFIG.PLACE_ID
  if(CONFIG.PLACE_ID && CONFIG.PLACE_ID !== 'YOUR_PLACE_ID_HERE'){
    const service = new google.maps.places.PlacesService(map);
    service.getDetails({ placeId: CONFIG.PLACE_ID, fields: ['name','reviews','user_ratings_total','url','geometry','formatted_address'] }, (place, status) => {
      if(status === google.maps.places.PlacesServiceStatus.OK && place && document.getElementById('reviews-container')) {
        const container = document.getElementById('reviews-container');
        container.innerHTML = place.reviews.map(r => `<div class="p-4 rounded bg-[#fff7f1]"><strong>${r.author_name}</strong><p class="mt-2">${r.text}</p><div class="text-xs text-gray-500 mt-2">${r.relative_time_description}</div></div>`).join('');
      }
    });
  }
}

/* PWA service worker registration */
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker?.register('/service-worker.js').then(reg => console.log('SW registered:', reg.scope)).catch(err => console.warn('SW failed', err));
  });
}
