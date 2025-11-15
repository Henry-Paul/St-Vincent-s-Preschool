// main.js - consolidated site scripts
// - EmailJS config (from your uploaded file)
// - Menu toggle with accurate icon
// - Modal open/close
// - Contact form EmailJS send
// - Gallery slider
// - Program details modal + prefill contact form
// - WhatsApp widget
// - Google Maps (initMap + reviews) if configured
// - PWA registration (service worker)

const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_14zrdg6',
    TEMPLATE_ID: 'template_snxhxlk',
    PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
  },
  // Replace with your Google Place ID to fetch reviews (optional)
  PLACE_ID: 'YOUR_PLACE_ID_HERE',
  // WhatsApp number (country code + number, no +)
  WHATSAPP_NUMBER: '919032249494'
};

/* ===== EmailJS init ===== */
if(window.emailjs) { try{ emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY); } catch(e){ console.warn('EmailJS init failed', e); } }

/* ===== helpers ===== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ===== Menu toggle (accurate icon) ===== */
(function menuSetup(){
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  function setIcon(isOpen){
    if(!menuBtn) return;
    menuBtn.innerHTML = isOpen
      ? '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M6 18L18 6M6 6l12 12\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>'
      : '<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-6 h-6\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M4 6h16M4 12h16M4 18h16\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>';
  }
  if(menuBtn){
    setIcon(false);
    menuBtn.addEventListener('click', ()=> {
      const isHidden = mobileMenu && mobileMenu.classList.contains('hidden');
      if(mobileMenu) mobileMenu.classList.toggle('hidden');
      setIcon(isHidden);
      menuBtn.setAttribute('aria-expanded', String(isHidden));
    });
  }
})();

/* ===== Modal handling (data-open-modal / data-close-modal) ===== */
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open-modal]');
  if(open){
    const id = open.getAttribute('data-open-modal');
    const modal = document.getElementById(id);
    if(modal){ modal.classList.remove('hidden'); document.body.style.overflow='hidden'; }
  }
  const close = e.target.closest('[data-close-modal]');
  if(close){
    const modal = close.closest('.modal');
    if(modal){ modal.classList.add('hidden'); document.body.style.overflow=''; }
  }
});
document.addEventListener('keydown', (e) => { if(e.key==='Escape'){ document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')); document.body.style.overflow=''; } });

/* ===== Contact form (modal & page) ===== */
function initContactForms(){
  // modal form (id="contact-form" used on modal and on contact page)
  const forms = Array.from(document.querySelectorAll('#contact-form'));
  forms.forEach(form => {
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
        if(errorEl) { errorEl.textContent = 'Please enter name and phone.'; errorEl.classList.remove('hidden'); }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const submitText = form.querySelector('#submit-text');
      const spinner = form.querySelector('#submit-spinner');
      if(submitBtn){ submitBtn.disabled = true; if(submitText) submitText.textContent='Sending...'; if(spinner) spinner.classList.remove('hidden'); }

      const payload = { parentName, phone, childAge, program, message, timestamp: new Date().toLocaleString() };

      emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, payload)
        .then(() => {
          if(successEl){ successEl.classList.remove('hidden'); successEl.textContent = 'Thank you! We will call you soon.'; }
          form.reset();
          if(submitBtn){ submitBtn.disabled=false; if(submitText) submitText.textContent='Submit Inquiry'; if(spinner) spinner.classList.add('hidden'); }
          // close modal if inside one
          const modal = form.closest('.modal');
          if(modal){ setTimeout(()=>{ modal.classList.add('hidden'); document.body.style.overflow=''; }, 1400); }
        }).catch((err)=>{
          console.error('EmailJS error', err);
          if(errorEl){ errorEl.classList.remove('hidden'); errorEl.textContent = 'There was an error. Try again later.'; }
          if(submitBtn){ submitBtn.disabled=false; if(submitText) submitText.textContent='Submit Inquiry'; if(spinner) spinner.classList.add('hidden'); }
        });
    });
  });
}
initContactForms();

/* ===== Gallery slider ===== */
(function sliderSetup(){
  const slider = document.getElementById('image-slider');
  if(!slider) return;
  const slides = slider.querySelectorAll('.image-slide');
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  let idx = 0;
  const total = slides.length;
  function update(){
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
  }
  prev?.addEventListener('click', ()=> { idx = (idx-1+total)%total; update(); });
  next?.addEventListener('click', ()=> { idx = (idx+1)%total; update(); });
  dots.forEach(d => d.addEventListener('click',(e)=>{ idx = Number(e.target.dataset.index); update(); }));
  setInterval(()=>{ idx = (idx+1)%total; update(); }, 6000);
  update();
})();

/* ===== Program details modal & prefill contact form ===== */
(function programs(){
  // open details modal (build on-click)
  document.querySelectorAll('.open-program-details').forEach(btn => {
    btn.addEventListener('click', ()=> {
      const name = btn.dataset.program;
      const modalHtml = `
        <div class="program-modal fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div class="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <button class="close-program-modal float-right text-gray-600">×</button>
            <h3 class="text-2xl font-bold mb-2">${name}</h3>
            <p class="text-gray-700 mb-4">Full details for ${name} — curriculum, timings, teacher ratio, sample day, fees summary and FAQs for parents.</p>
            <div class="flex gap-3">
              <button class="btn-primary enquire-from-program" data-program="${name}">Enquire Now</button>
              <button class="btn-primary-outline close-program-modal">Close</button>
            </div>
          </div>
        </div>`;
      const wrap = document.createElement('div');
      wrap.innerHTML = modalHtml;
      document.body.appendChild(wrap);

      wrap.querySelectorAll('.close-program-modal').forEach(x => x.addEventListener('click', ()=> wrap.remove()));
      wrap.querySelector('.enquire-from-program').addEventListener('click', (e)=> {
        const program = e.currentTarget.dataset.program || name;
        wrap.remove();
        // open contact modal then prefill
        const contactModal = document.getElementById('contact-modal');
        if(contactModal) {
          contactModal.classList.remove('hidden');
          document.body.style.overflow='hidden';
          setTimeout(()=> {
            const programSelect = document.querySelector('#contact-modal select[name="program"], #contact-form select[name="program"]');
            if(programSelect) programSelect.value = program.toLowerCase() || program;
          }, 120);
        }
      });
    });
  });

  // When clicking program enquiry buttons directly, prefill program value
  document.querySelectorAll('.open-contact-modal-from-program').forEach(btn => {
    btn.addEventListener('click', ()=> {
      const v = btn.dataset.program || '';
      setTimeout(()=> {
        const programSelect = document.querySelector('#contact-modal select[name="program"], #contact-form select[name="program"]');
        if(programSelect) programSelect.value = v;
      }, 120);
    });
  });
})();

/* ===== WhatsApp widget behavior ===== */
(function whatsapp(){
  const open = document.getElementById('whatsapp-open');
  const panel = document.getElementById('whatsapp-panel') || document.getElementById('whatsapp-panel');
  const suggestions = Array.from(document.querySelectorAll('.wa-suggest, .wa-suggest'));
  let selectedMsg = suggestions[0]?.dataset.msg || "Hi, I'd like admissions info";

  suggestions.forEach(s => s.addEventListener('click', (e) => { selectedMsg = e.currentTarget.dataset.msg; suggestions.forEach(x=>x.classList.remove('selected')); e.currentTarget.classList.add('selected'); }));

  open?.addEventListener('click', () => {
    if(panel) panel.classList.toggle('hidden');
  });
  const sendBtn = document.getElementById('wa-send');
  sendBtn?.addEventListener('click', () => {
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(selectedMsg)}`;
    window.open(url, '_blank');
  });
})();

/* ===== Google Maps + Places reviews (optional) ===== */
function initMap(){
  try{
    const mapEl = document.getElementById('map');
    if(!mapEl) return;
    const defaultCenter = { lat: 17.4447, lng: 78.3432 }; // approximate Hyderabad
    const map = new google.maps.Map(mapEl, { center: defaultCenter, zoom: 16 });
    const service = new google.maps.places.PlacesService(map);
    if(CONFIG.PLACE_ID && CONFIG.PLACE_ID !== 'YOUR_PLACE_ID_HERE'){
      service.getDetails({ placeId: CONFIG.PLACE_ID, fields: ['name','geometry','formatted_address','rating','user_ratings_total','reviews','url'] }, (place, status) => {
        if(status === google.maps.places.PlacesServiceStatus.OK && place){
          map.setCenter(place.geometry.location);
          new google.maps.Marker({ map, position: place.geometry.location });
          // populate reviews
          const reviewsContainer = document.getElementById('reviews-container');
          if(place.reviews && place.reviews.length && reviewsContainer){
            reviewsContainer.innerHTML = place.reviews.map(r => `
              <div class="p-4 border rounded bg-[#fff7f1]">
                <div class="flex justify-between items-center"><strong>${escapeHtml(r.author_name || 'Parent')}</strong><span>${'★'.repeat(Math.round(r.rating || 0))}</span></div>
                <p class="mt-2 text-sm">${escapeHtml(r.text || '')}</p>
                <div class="text-xs text-gray-500 mt-2">${escapeHtml(r.relative_time_description || '')}</div>
              </div>
            `).join('');
            // add link to full listing if more ratings exist
            if(place.user_ratings_total && place.reviews.length < place.user_ratings_total){
              const more = document.createElement('div'); more.className='mt-2 text-sm';
              more.innerHTML = `<a href="${place.url}" target="_blank" rel="noopener">Read more reviews on Google Maps (${place.user_ratings_total})</a>`;
              reviewsContainer.appendChild(more);
            }
          } else {
            document.getElementById('reviews-container').innerHTML = '<div class="text-sm text-gray-600">No reviews available.</div>';
          }
        } else {
          console.warn('PlacesService status:', status);
          document.getElementById('reviews-container').innerHTML = '<div class="text-sm text-gray-600">Reviews unavailable now.</div>';
        }
      });
    } else {
      document.getElementById('reviews-container').innerHTML = '<div class="text-sm text-gray-600">Add your Google Place ID in js/main.js to show live reviews.</div>';
    }
  } catch(err){ console.warn('initMap error', err); }
}
function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

/* ===== PWA: register service worker ===== */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker?.register('/service-worker.js').then(reg => console.log('SW registered', reg.scope)).catch(err => console.warn('SW registration failed', err));
  });
}
