// main.js - site interactivity, modals and EmailJS integration

// ---------- EmailJS configuration (from your uploaded file) ----------
const EMAILJS = {
  SERVICE_ID: 'service_14zrdg6',
  TEMPLATE_ID: 'template_snxhxlk',
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
};

// initialize EmailJS
if (window.emailjs) {
  emailjs.init(EMAILJS.PUBLIC_KEY);
} else {
  console.warn('EmailJS SDK not loaded.');
}

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function openModal(el){ el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeModal(el){ el.classList.add('hidden'); document.body.style.overflow = ''; }

// ---------- mobile menu ----------
$('#menu-btn')?.addEventListener('click', () => { $('#mobile-menu').classList.toggle('hidden'); });
$('#menu-btn-2')?.addEventListener('click', () => { $('#mobile-menu')?.classList.toggle('hidden'); });

// ---------- contact modal wiring ----------
const contactModal = $('#contact-modal');
const openHeroBtn = $('#open-contact-modal-hero');
const openBottomBtn = $('#open-contact-modal-bottom');
const closeContactModal = $('#close-contact-modal');
const cancelContactBtn = $('#contact-cancel');

openHeroBtn?.addEventListener('click', () => openModal(contactModal));
openBottomBtn?.addEventListener('click', () => openModal(contactModal));
closeContactModal?.addEventListener('click', () => closeModal(contactModal));
cancelContactBtn?.addEventListener('click', () => closeModal(contactModal));

// Open from programs "Enquire" buttons — copy program name into form
$$('.open-contact-from-program').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const program = e.currentTarget.dataset.program || '';
    $('#program')?.value = program;
    openModal(contactModal);
  });
});

// ---------- contact form submission (modal) ----------
const modalForm = $('#contact-form-modal');
const modalSuccess = $('#modal-success');
const modalError = $('#modal-error');
const modalSubmit = $('#contact-submit-modal');

if(modalForm){
  modalForm.addEventListener('submit', function(e){
    e.preventDefault();
    modalSuccess.classList.add('hidden');
    modalError.classList.add('hidden');

    const payload = {
      parentName: modalForm.parentName?.value || '',
      phone: modalForm.phone?.value || '',
      childAge: modalForm.childAge?.value || '',
      program: modalForm.program?.value || '',
      message: modalForm.message?.value || '',
      timestamp: new Date().toLocaleString()
    };

    if(!payload.parentName || !payload.phone){
      modalError.textContent = 'Please fill name and phone.';
      modalError.classList.remove('hidden');
      return;
    }

    modalSubmit.disabled = true;
    modalSubmit.textContent = 'Sending...';

    emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_ID, payload)
      .then((resp) => {
        modalSuccess.classList.remove('hidden');
        modalForm.reset();
        modalSubmit.disabled = false;
        modalSubmit.textContent = 'Submit';
        setTimeout(() => { closeModal(contactModal); }, 1400);
      }).catch((err) => {
        console.error(err);
        modalError.textContent = 'Could not send. Try again.';
        modalError.classList.remove('hidden');
        modalSubmit.disabled = false;
        modalSubmit.textContent = 'Submit';
      });
  });
}

// ---------- contact page form submission ----------
const contactPageForm = $('#contact-form');
const contactPageSuccess = $('#contact-success');
const contactPageError = $('#contact-error');
const contactPageSubmit = $('#contact-submit');

if(contactPageForm){
  contactPageForm.addEventListener('submit', function(e){
    e.preventDefault();
    contactPageSuccess.classList.add('hidden');
    contactPageError.classList.add('hidden');

    const payload = {
      parentName: contactPageForm.parentName?.value || '',
      phone: contactPageForm.phone?.value || '',
      childAge: contactPageForm.childAge?.value || '',
      program: contactPageForm.program?.value || '',
      message: contactPageForm.message?.value || '',
      timestamp: new Date().toLocaleString()
    };

    if(!payload.parentName || !payload.phone){
      contactPageError.textContent = 'Please fill name and phone.';
      contactPageError.classList.remove('hidden');
      return;
    }

    contactPageSubmit.disabled = true;
    contactPageSubmit.textContent = 'Sending...';

    emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_ID, payload)
      .then((resp) => {
        contactPageSuccess.classList.remove('hidden');
        contactPageForm.reset();
        contactPageSubmit.disabled = false;
        contactPageSubmit.textContent = 'Submit Inquiry';
      }).catch((err) => {
        console.error(err);
        contactPageError.textContent = 'Could not send. Try again.';
        contactPageError.classList.remove('hidden');
        contactPageSubmit.disabled = false;
        contactPageSubmit.textContent = 'Submit Inquiry';
      });
  });
}

// ---------- testimonials renderer ----------
const testimonials = [
  { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
  { name: "Latha B.", text: "St. Vincent School has excellent facilities... One of the Best Schools in ChandaNagar" },
  { name: "Shashank Bhardwaj", text: "My child loves going to this preschool! The teachers are caring..." }
];

function renderTestimonials(){
  const slider = $('#testimonial-slider');
  if(!slider) return;
  slider.innerHTML = testimonials.map(t => `
    <div class="p-4 bg-white rounded shadow">
      <p class="text-sm text-gray-700">"${t.text}"</p>
      <p class="mt-2 font-semibold text-sm">- ${t.name}</p>
    </div>
  `).join('');
}
renderTestimonials();

// ---------- auto popup (show once per session) ----------
const autoPopup = $('#auto-popup');
const closeAutoPopupBtn = $('#close-auto-popup');
const autoPopupCta = $('#auto-popup-cta');

if(!sessionStorage.getItem('seenAutopopup')){
  // show after 1.2s
  setTimeout(() => openModal(autoPopup), 1200);
  sessionStorage.setItem('seenAutopopup','1');
}
closeAutoPopupBtn?.addEventListener('click', () => closeModal(autoPopup));
autoPopupCta?.addEventListener('click', () => {
  closeModal(autoPopup);
  openModal(contactModal);
});

// ---------- small safe liveness check for emailjs ----------
window.addEventListener('load', () => {
  if(window.emailjs) console.log('EmailJS ready');
});
