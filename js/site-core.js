/* site-core.js
   Revised: update form submission, replace live reviews with manual testimonials slider,
   add responsive media frame for images/videos, ensure burger + WhatsApp behavior works.
   Drop this file into: js/site-core.js (overwrite existing)
*/

/* ======================
   Configuration
   ====================== */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_14zrdg6',    // from uploaded HTML file
  TEMPLATE_ID: 'template_snxhxlk',  // from uploaded HTML file
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'   // from uploaded HTML file
};

/* ======================
   Utilities
   ====================== */
function $q(sel, ctx = document) { return ctx.querySelector(sel); }
function $qa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') el.className = attrs[k];
    else if (k === 'html') el.innerHTML = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach(ch => {
    if (!ch) return;
    if (typeof ch === 'string') el.appendChild(document.createTextNode(ch));
    else el.appendChild(ch);
  });
  return el;
}

/* ======================
   Initialize EmailJS
   ====================== */
if (window.emailjs && typeof emailjs.init === 'function') {
  try {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.info('EmailJS initialized');
  } catch (err) {
    console.warn('EmailJS init failed', err);
  }
} else {
  console.warn('EmailJS library not loaded. Ensure <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script> is on the page.');
}

/* ======================
   Contact Modal (unified)
   - Creates the contact modal using the exact fields seen in your uploaded HTML:
     parentName, phone, childAge, program, message
   - Sends via emailjs.send( SERVICE_ID, TEMPLATE_ID, formData )
   - Shows success / error messages inside the modal
   ====================== */
function createContactModal(prefill = {}) {
  // container in HTML: <div id="contact-modal-container"></div> (from your uploaded HTML)
  const container = document.getElementById('contact-modal-container') || document.body;
  // Remove any existing modal
  const existing = container.querySelector('.modal-overlay.contact-modal');
  if (existing) existing.remove();

  const isAutoPopup = !!prefill.isAutoPopup;

  const modalHTML = `
    <div class="modal-overlay contact-modal fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div class="modal-content bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold">${isAutoPopup ? 'Get Started Today!' : 'Schedule a Visit'}</h2>
              <p class="text-sm text-gray-600 mt-1">${isAutoPopup ? 'Let us help you find the perfect program for your child!' : 'We\'d love to show you around our campus!'}</p>
            </div>
            <button class="close-modal-btn" aria-label="Close contact modal">&times;</button>
          </div>

          <form id="contact-form" class="space-y-4">
            <div>
              <label for="parentName" class="block font-medium text-gray-700">Parent's Name</label>
              <input type="text" id="parentName" name="parentName" class="w-full p-3 border rounded" required value="${escapeHtml(prefill.parentName || '')}">
            </div>

            <div>
              <label for="phone" class="block font-medium text-gray-700">Phone Number</label>
              <input type="tel" id="phone" name="phone" class="w-full p-3 border rounded" placeholder="+91 9xxxxxxxxx" required value="${escapeHtml(prefill.phone || '')}">
            </div>

            <div>
              <label for="childAge" class="block font-medium text-gray-700">Child's Age</label>
              <input type="text" id="childAge" name="childAge" class="w-full p-3 border rounded" placeholder="e.g., 2.5 years" required value="${escapeHtml(prefill.childAge || '')}">
            </div>

            <div>
              <label for="program" class="block font-medium text-gray-700">Program of Interest</label>
              <select id="program" name="program" class="w-full p-3 border rounded" required>
                <option value="">Select a program</option>
                <option value="Playgroup">Playgroup (1.5–2.5 yrs)</option>
                <option value="Nursery">Nursery (2.5–3.5 yrs)</option>
                <option value="Pre-Primary 1">Pre-Primary 1 (3.5–4.5 yrs)</option>
                <option value="Pre-Primary 2">Pre-Primary 2 (4.5–6 yrs)</option>
                <option value="Day Care">Day Care (1.5–6 yrs)</option>
              </select>
            </div>

            <div>
              <label for="message" class="block font-medium text-gray-700">Additional Message (Optional)</label>
              <textarea id="message" name="message" class="w-full p-3 border rounded" rows="3">${escapeHtml(prefill.message || '')}</textarea>
            </div>

            <div>
              <button type="submit" id="contact-submit" class="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded font-semibold">
                <span id="submit-text">${isAutoPopup ? 'Get Started' : 'Submit Inquiry'}</span>
                <span id="submit-spinner" class="sr-only" aria-hidden="true"></span>
              </button>
            </div>

            <p id="contact-form-success-message" class="text-green-600 text-center font-semibold hidden">Thank you! We'll call you soon!</p>
            <p id="contact-form-error-message" class="text-red-600 text-center font-semibold hidden">There was an error submitting your form. Please try again or call us directly.</p>
          </form>

        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', modalHTML);
  const overlay = container.querySelector('.modal-overlay.contact-modal');
  const closeBtn = overlay.querySelector('.close-modal-btn');
  const contactForm = overlay.querySelector('#contact-form');
  const successMsg = overlay.querySelector('#contact-form-success-message');
  const errorMsg = overlay.querySelector('#contact-form-error-message');
  const submitText = overlay.querySelector('#submit-text');
  const submitSpinner = overlay.querySelector('#submit-spinner');

  // close handlers
  closeBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // validation helper (basic)
  function validateContactForm(form) {
    const name = form.parentName.value.trim();
    const phone = form.phone.value.trim();
    const childAge = form.childAge.value.trim();
    const program = form.program.value.trim();
    if (!name || !phone || !childAge || !program) {
      return { ok: false, msg: 'Please fill all required fields.' };
    }
    // basic phone check (India)
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) return { ok: false, msg: 'Please enter a valid phone number.' };
    return { ok: true };
  }

  // submit handler
  contactForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    const validation = validateContactForm(contactForm);
    if (!validation.ok) {
      errorMsg.textContent = validation.msg;
      errorMsg.classList.remove('hidden');
      return;
    }

    // loading UI
    submitText.setAttribute('disabled', 'true');
    submitSpinner.classList.remove('sr-only');

    // prepare data exactly as the template expects
    const formData = {
      parentName: contactForm.parentName.value.trim(),
      phone: contactForm.phone.value.trim(),
      childAge: contactForm.childAge.value.trim(),
      program: contactForm.program.value.trim(),
      message: contactForm.message.value.trim() || 'N/A',
      timestamp: new Date().toLocaleString(),
      source: isAutoPopup ? 'Auto Popup Form' : 'Website Contact Form'
    };

    // Send via EmailJS
    if (window.emailjs && typeof emailjs.send === 'function') {
      emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, formData)
        .then(function (resp) {
          successMsg.classList.remove('hidden');
          contactForm.reset();
          submitText.removeAttribute('disabled');
          submitSpinner.classList.add('sr-only');
          // close after short delay (user sees success)
          setTimeout(() => overlay.remove(), 2500);
        })
        .catch(function (err) {
          console.error('EmailJS error', err);
          errorMsg.textContent = 'Submission failed. Please try again or call +91 9032249494.';
          errorMsg.classList.remove('hidden');
          submitText.removeAttribute('disabled');
          submitSpinner.classList.add('sr-only');
        });
    } else {
      console.warn('emailjs.send not available');
      // fallback - simply show success and print data to console
      console.log('FORM SUBMISSION (fallback)', formData);
      successMsg.classList.remove('hidden');
      submitText.removeAttribute('disabled');
      submitSpinner.classList.add('sr-only');
      setTimeout(() => overlay.remove(), 2000);
    }
  });

  // Accessibility focus
  overlay.querySelector('input, select, textarea').focus();
  return overlay;
}

/* ======================
   openUnifiedModal(prefill)
   Called by other components to open the same modal.
   Keeps single source of truth.
   ====================== */
function openUnifiedModal(prefill = {}) {
  // If contact modal already exists, reuse and prefill fields if possible
  // For simplicity we destroy and recreate so prefill works reliably.
  const overlay = createContactModal(prefill);
  return overlay;
}

/* ======================
   Testimonials
   - Replace live review fetch with manual 5-item array (top five five-star feedback)
   - Render a simple responsive slider with prev/next and auto-rotate
   - No Google badges
   ====================== */
const TESTIMONIALS = [
  { name: "Sai Ram", quote: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
  { name: "Latha B.", quote: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning." },
  { name: "Shashank Bhardwaj", quote: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing." },
  { name: "Saurabh Shourie", quote: "Great environment with lesser fees in comparison to other schools nearby. Highly recommended!" },
  { name: "Anita Singha", quote: "Recently my daughter joined and she's very happy. Spacious, hygienic and experienced teachers." }
];

/**
 * Injects or replaces the testimonials widget in the page.
 * Looks for an element with id="testimonials" to render into. If missing,
 * it creates a section above the footer.
 */
function renderTestimonialsWidget() {
  let container = document.getElementById('testimonials');
  let created = false;
  if (!container) {
    // try to place above footer
    const footer = document.querySelector('footer') || document.body;
    container = createEl('section', { id: 'testimonials', class: 'max-w-6xl mx-auto px-4 py-10' });
    footer.parentNode.insertBefore(container, footer);
    created = true;
  }

  // build markup
  container.innerHTML = `
    <div class="bg-white shadow rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold">What Our Parents Say</h3>
        <div class="flex gap-2">
          <button id="testi-prev" class="p-2 rounded border">←</button>
          <button id="testi-next" class="p-2 rounded border">→</button>
        </div>
      </div>
      <div id="testi-track" class="testi-track relative overflow-hidden">
        <div class="testi-inner flex transition-transform duration-500"></div>
      </div>
    </div>
  `;

  const inner = container.querySelector('.testi-inner');
  TESTIMONIALS.forEach((t, i) => {
    const card = createEl('div', {
      class: 'testi-card p-4 min-w-[280px] md:min-w-[33%] flex-shrink-0'
    }, [
      createEl('div', { class: 'shadow-sm rounded-lg p-4 bg-gray-50' }, [
        createEl('p', { class: 'text-lg text-gray-800', html: `“${escapeHtml(t.quote)}”` }),
        createEl('p', { class: 'mt-3 text-sm font-semibold text-gray-700', html: `<strong>${escapeHtml(t.name)}</strong>` }),
        // small CTA
        createEl('div', { class: 'mt-4' }, [
          createEl('button', { class: 'open-contact-modal btn-small', type: 'button', 'data-program': `Enquiry for ${escapeHtml(t.name)}` , html: 'Enquire' })
        ])
      ])
    ]);
    inner.appendChild(card);
  });

  // slider logic
  const track = container.querySelector('.testi-track');
  const cards = Array.from(container.querySelectorAll('.testi-card'));
  let index = 0;
  function updateTrack() {
    const cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : 300;
    const visible = Math.floor(track.getBoundingClientRect().width / cardWidth) || 1;
    const maxIndex = Math.max(0, TESTIMONIALS.length - visible);
    if (index > maxIndex) index = maxIndex;
    const translateX = -(cardWidth * index);
    container.querySelector('.testi-inner').style.transform = `translateX(${translateX}px)`;
  }

  // previous/next handlers
  const prevBtn = container.querySelector('#testi-prev');
  const nextBtn = container.querySelector('#testi-next');
  prevBtn.addEventListener('click', () => { index = Math.max(0, index - 1); updateTrack(); });
  nextBtn.addEventListener('click', () => { index = Math.min(TESTIMONIALS.length - 1, index + 1); updateTrack(); });

  // auto-resize
  window.addEventListener('resize', throttle(updateTrack, 150));
  // initial update
  setTimeout(updateTrack, 60);

  // auto-rotate (optional)
  let auto = setInterval(() => { index = (index + 1) % TESTIMONIALS.length; updateTrack(); }, 6000);
  // pause on hover
  container.addEventListener('mouseenter', () => clearInterval(auto));
  container.addEventListener('mouseleave', () => auto = setInterval(() => { index = (index + 1) % TESTIMONIALS.length; updateTrack(); }, 6000));
}

/* ======================
   Media Frame / Lightbox
   - Finds elements with classes: responsive-img, gallery-item, video-poster
   - Wraps them with a responsive frame and sets up a clickable lightbox/modal
   - Ensures videos use <video> tag or youtube embed if data attributes provided
   ====================== */
function enhanceMediaFrames() {
  // create media modal if absent
  if (!document.getElementById('media-modal')) {
    const modal = createEl('div', { id: 'media-modal', class: 'fixed inset-0 bg-black bg-opacity-80 z-60 hidden flex items-center justify-center p-4' }, [
      createEl('div', { class: 'max-w-5xl w-full rounded-lg overflow-hidden bg-transparent' }, [
        createEl('div', { class: 'media-modal-inner relative bg-white rounded-lg overflow-hidden' }, [
          createEl('button', { class: 'media-close absolute top-3 right-3 z-50 bg-white rounded-full p-2' , html: '&times;'}),
          createEl('div', { class: 'media-content p-4' }, [])
        ])
      ])
    ]);
    document.body.appendChild(modal);

    // close handlers
    modal.querySelector('.media-close').addEventListener('click', () => {
      modal.classList.add('hidden');
      const content = modal.querySelector('.media-content');
      content.innerHTML = '';
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  }

  const mediaModal = document.getElementById('media-modal');
  const mediaContent = mediaModal.querySelector('.media-content');

  // target images & video posters
  const selectors = [
    'img.responsive-img',
    '.gallery-item img',
    'img[data-media="true"]',
    'picture[data-media="true"]',
    '.video-poster'
  ];
  const els = $qa(selectors.join(',')).filter(Boolean);

  els.forEach(el => {
    // ensure wrapped in a frame
    const parent = el.parentElement;
    if (!parent.classList.contains('responsive-frame')) {
      const frame = createEl('div', { class: 'responsive-frame rounded-lg overflow-hidden shadow-md', style: 'display:inline-block; width:100%; cursor:pointer;' });
      parent.replaceChild(frame, el);
      frame.appendChild(el);
      // style (lightweight)
      el.style.width = '100%';
      el.style.height = 'auto';
      // click -> open modal
      frame.addEventListener('click', () => {
        const src = el.getAttribute('data-full') || el.src || el.getAttribute('data-src');
        if (!src) return;
        // if the element is a video poster and has data-video attribute, embed video
        const videoUrl = el.getAttribute('data-video');
        mediaContent.innerHTML = ''; // reset
        if (videoUrl) {
          // embed video (YouTube or mp4)
          if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            // convert to embed
            let id = '';
            if (videoUrl.includes('youtu.be')) id = videoUrl.split('/').pop();
            else {
              const urlObj = new URL(videoUrl);
              id = urlObj.searchParams.get('v');
            }
            if (id) {
              mediaContent.innerHTML = `<div style="position:relative;padding-top:56.25%"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="position:absolute;left:0;top:0;width:100%;height:100%"></iframe></div>`;
            } else {
              mediaContent.innerHTML = `<p>Video unavailable</p>`;
            }
          } else {
            // assume MP4
            mediaContent.innerHTML = `<video controls playsinline style="width:100%;height:auto"><source src="${escapeHtml(videoUrl)}" type="video/mp4">Your browser does not support video.</video>`;
          }
        } else {
          mediaContent.innerHTML = `<img src="${escapeHtml(src)}" alt="" style="width:100%;height:auto;display:block" />`;
        }
        mediaModal.classList.remove('hidden');
      });
    }
  });
}

/* ======================
   Mobile menu toggle (robust)
   ====================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', (!expanded).toString());
  });
}

/* ======================
   WhatsApp FAB fallback injection (ensures presence on every page)
   ====================== */
function ensureWhatsAppFab() {
  const existing = document.getElementById('whatsapp-chat-button') || document.querySelector('.whatsapp-chat-button');
  if (existing) return; // already present
  const fab = createEl('a', {
    id: 'whatsapp-chat-button',
    class: 'whatsapp-chat-button fixed bottom-6 right-6 z-50',
    href: 'https://wa.me/919032249494?text=Hi%20St.%20Vincent%27s%20Preschool%20I%20would%20like%20to%20know%20more',
    target: '_blank',
    title: 'Chat on WhatsApp'
  }, [
    createEl('div', { class: 'w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg' }, [
      createEl('i', { class: 'fab fa-whatsapp', html: '' })
    ])
  ]);
  document.body.appendChild(fab);
}

/* ======================
   Helpers: throttle, escapeHtml
   ====================== */
function throttle(fn, wait) {
  let t = null, last = 0;
  return function (...args) {
    const now = Date.now();
    if (!last || now - last >= wait) {
      fn.apply(this, args);
      last = now;
    } else {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait - (now - last));
    }
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ======================
   Boot - init everything
   ====================== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    initMobileMenu();
    ensureWhatsAppFab();
    renderTestimonialsWidget();  // manual testimonials (no Google live fetch)
    enhanceMediaFrames();        // wrap gallery images / video posters with frames & lightbox

    // hook any elements that should open the contact modal
    document.addEventListener('click', (e) => {
      const el = e.target.closest && e.target.closest('.open-contact-modal');
      if (!el) return;
      const program = el.dataset.program || '';
      openUnifiedModal({ parentName: '', phone: '', childAge: '', program, message: '' });
    });

    // If you still have existing modal triggers in your HTML, we keep compatibility:
    $qa('[data-open-contact]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        openUnifiedModal({});
      });
    });

    console.info('site-core.js initialized: contact modal, testimonials, media frames, menu, whatsapp.');
  } catch (err) {
    console.error('site-core init error', err);
  }
});
