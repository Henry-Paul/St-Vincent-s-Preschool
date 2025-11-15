// main.js - robust menu, image fallback, EmailJS, modal & forms (copy this file exactly)

// ---------- EmailJS configuration (from your uploaded file) ----------
const EMAILJS = {
  SERVICE_ID: 'service_14zrdg6',
  TEMPLATE_ID: 'template_snxhxlk',
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
};

// initialize EmailJS if available
if (window.emailjs) {
  emailjs.init(EMAILJS.PUBLIC_KEY);
} else {
  console.warn('EmailJS SDK not loaded.');
}

// --- helper selectors ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ---------- robust mobile menu toggler ----------
(function mobileMenuSetup(){
  // mobile menu id is 'mobile-menu' (present in all pages)
  const mobileMenu = document.getElementById('mobile-menu');

  // attach all elements with class 'menu-toggle' to toggle the menu
  const toggles = Array.from(document.querySelectorAll('.menu-toggle'));

  // fallback: any button with "menu" in its id or class
  if(toggles.length === 0){
    Array.from(document.querySelectorAll('button')).forEach(b=>{
      if(/menu/i.test(b.id || b.className)) toggles.push(b);
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if(!mobileMenu) {
        console.warn('[menu] mobile menu not found');
        return;
      }
      mobileMenu.classList.toggle('hidden');
      const expanded = !mobileMenu.classList.contains('hidden');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });
})();

// ---------- image error handler (reports missing images + provides placeholder) ----------
(function imageErrorHandler(){
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function(){
        console.warn('[img-missing] Failed to load:', img.getAttribute('src'));
        // small neutral svg fallback
        img.src = "data:image/svg+xml;utf8," + encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999' font-size='20'>Image not found</text></svg>`
        );
      });
      if(img.complete && img.naturalWidth === 0){
        img.dispatchEvent(new Event('error'));
      }
    });
  });
})();

// ---------- modal helpers (open / close by data attribute) ----------
function openModalById(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModalByEl(el){
  if(!el) return;
  const modal = el.closest('.modal');
  if(modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// wire buttons with data-open-modal and data-close-modal
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open-modal]');
  if(open){
    const id = open.getAttribute('data-open-modal');
    openModalById(id);
  }
  const close = e.target.closest('[data-close-modal]');
  if(close){
    closeModalByEl(close);
  }
});

// open contact modal buttons (some pages use data attributes or specific selectors)
$$('[data-open-modal="contact-modal"]').forEach(btn => {
  btn.addEventListener('click', () => openModalById('contact-modal'));
});

// auto popup (show once per session)
(function autoPopup(){
  const auto = document.getElementById('auto-popup');
  if(!auto) return;
  if(!sessionStorage.getItem('seenAutopopup')){
    setTimeout(()=> openModalById('auto-popup'), 1200);
    sessionStorage.setItem('seenAutopopup','1');
  }
  const autoCta = document.getElementById('auto-popup-cta');
  if(autoCta) autoCta.addEventListener('click', ()=>{
    closeModalByEl(autoCta);
    openModalById('contact-modal');
  });
})();

// ---------- connect "open from program" buttons to modal and copy program value ----------
$$('.open-contact-from-program').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const program = btn.dataset.program || '';
    // modal selects have id 'modal-program' and page selects 'page-program'
    const modalProgram = $('#modal-program');
    if(modalProgram) modalProgram.value = program;
    openModalById('contact-modal');
  });
});

// ---------- contact modal form submission ----------
(function contactModalForm(){
  const form = $('#contact-form-modal');
  if(!form) return;

  const successEl = $('#modal-success');
  const errorEl = $('#modal-error');
  const submitBtn = $('#contact-submit-modal');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    successEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');

    const payload = {
      parentName: form.querySelector('[name="parentName"]')?.value || '',
      phone: form.querySelector('[name="phone"]')?.value || '',
      childAge: form.querySelector('[name="childAge"]')?.value || '',
      program: form.querySelector('[name="program"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || '',
      timestamp: new Date().toLocaleString()
    };

    if(!payload.parentName || !payload.phone){
      if(errorEl){ errorEl.textContent = 'Please fill name and phone.'; errorEl.classList.remove('hidden'); }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_ID, payload)
      .then(resp => {
        if(successEl) successEl.classList.remove('hidden');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        setTimeout(()=> closeModalByEl(submitBtn), 1400);
      }).catch(err => {
        console.error('EmailJS error', err);
        if(errorEl){ errorEl.textContent = 'Could not send. Try again.'; errorEl.classList.remove('hidden'); }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      });
  });
})();

// ---------- contact page form submission ----------
(function contactPageForm(){
  const form = $('#contact-form');
  if(!form) return;

  const successEl = $('#contact-success');
  const errorEl = $('#contact-error');
  const submitBtn = $('#contact-submit');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    successEl?.classList.add('hidden');
    errorEl?.classList.add('hidden');

    const payload = {
      parentName: form.querySelector('[name="parentName"]')?.value || '',
      phone: form.querySelector('[name="phone"]')?.value || '',
      childAge: form.querySelector('[name="childAge"]')?.value || '',
      program: form.querySelector('[name="program"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || '',
      timestamp: new Date().toLocaleString()
    };

    if(!payload.parentName || !payload.phone){
      if(errorEl){ errorEl.textContent = 'Please fill name and phone.'; errorEl.classList.remove('hidden'); }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_ID, payload)
      .then(resp => {
        if(successEl) successEl.classList.remove('hidden');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Inquiry';
      }).catch(err => {
        console.error('EmailJS error', err);
        if(errorEl){ errorEl.textContent = 'Could not send. Try again.'; errorEl.classList.remove('hidden'); }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Inquiry';
      });
  });
})();

// ---------- testimonials renderer (keeps UI consistent) ----------
(function renderTestimonials(){
  const testimonials = [
    { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
    { name: "Latha B.", text: "St. Vincent School has excellent facilities... One of the Best Schools in ChandaNagar" },
    { name: "Shashank Bhardwaj", text: "My child loves going to this preschool! The teachers are caring..." }
  ];
  const slider = $('#testimonial-slider');
  if(!slider) return;
  slider.innerHTML = testimonials.map(t => `
    <div class="p-4 bg-white rounded shadow">
      <p class="text-sm text-gray-700">"${t.text}"</p>
      <p class="mt-2 font-semibold text-sm">- ${t.name}</p>
    </div>
  `).join('');
})();
