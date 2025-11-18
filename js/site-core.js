/* js/site-core.js
   Master site script for St. Vincent's Preschool
   - Contact modal & EmailJS form submission
   - Testimonial slider (manual arrows only)
   - WhatsApp floating button
   - Mobile burger menu
   - Exposes openUnifiedModal({ prefillProgram })
*/

/* ========= CONFIG ========= */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_14zrdg6',
  TEMPLATE_ID: 'template_snxhxlk',
  PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
};

// Initialize EmailJS if available
if (window.emailjs && typeof emailjs.init === 'function') {
  try { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); console.info('EmailJS initialized'); }
  catch (e) { console.warn('EmailJS init failed', e); }
}

/* ========= UTILITIES ========= */
function disableBodyScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}
function enableBodyScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}
function createEl(tag, attrs = {}, html = '') {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') el.className = attrs[k];
    else if (k === 'style') el.style.cssText = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  if (html) el.innerHTML = html;
  return el;
}

/* ========= WHATSAPP FAB ========= */
function ensureWhatsAppFab() {
  if (document.getElementById('whatsapp-chat-button')) return;

  const a = createEl('a', {
    id: 'whatsapp-chat-button',
    href: 'https://wa.me/919032249494?text=Hello%2C%20I%20am%20interested%20in%20St.%20Vincent%27s%20Preschool%20programs.',
    target: '_blank',
    class: 'fixed bottom-6 right-6 z-50 transition-transform',
    title: 'Chat on WhatsApp'
  });

  a.style.zIndex = 9999;
  a.innerHTML = `
    <div style="width:64px;height:64px;border-radius:999px;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.15);">
      <i class="fab fa-whatsapp" style="color:white;font-size:28px"></i>
    </div>
  `;
  document.body.appendChild(a);
}

/* ========= MOBILE MENU ========= */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
  });
}

/* ========= CONTACT / ENQUIRY MODAL =========
   Modal HTML uses the *same fields* found in your source:
   parentName, phone, childAge, program, message
   (Structure referenced from your uploaded file.) 4
*/
function buildContactModalHTML(prefill = {}) {
  // childAge options and program values match your HTML
  return `
  <div class="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
    <div class="modal-content bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl">
      <div style="display:flex;flex-direction:column;height:100%;">
        <div class="p-6 border-b" style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h2 style="font-size:20px;margin:0;color:#111;font-weight:700;">${prefill.isAutoPopup ? 'Get Started Today!' : 'Schedule a Visit'}</h2>
            <p style="margin:6px 0 0;color:#555;">${prefill.isAutoPopup ? 'Let us help you find the perfect program for your child!' : 'We\'d love to show you around our campus!'}</p>
          </div>
          <button class="close-modal-btn" aria-label="Close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
        </div>

        <div class="p-6 overflow-auto" style="flex:1;">
          <form id="contact-form" class="space-y-4" novalidate>
            <div>
              <label for="parentName" style="font-weight:600;">Parent's Name</label>
              <input type="text" id="parentName" name="parentName" required style="width:100%;padding:12px;margin-top:6px;font-size:16px;">
            </div>

            <div>
              <label for="phone" style="font-weight:600;">Phone Number</label>
              <input type="tel" id="phone" name="phone" required style="width:100%;padding:12px;margin-top:6px;font-size:16px;">
            </div>

            <div>
              <label for="childAge" style="font-weight:600;">Child's Age</label>
              <select id="childAge" name="childAge" required style="width:100%;padding:12px;margin-top:6px;font-size:16px;">
                <option value="">Select age range</option>
                <option value="1.5 to 2 years">1.5 to 2 years</option>
                <option value="2 to 3 years">2 to 3 years</option>
                <option value="3 to 4 years">3 to 4 years</option>
                <option value="4 to 5 years">4 to 5 years</option>
                <option value="5 to 6 years">5 to 6 years</option>
              </select>
            </div>

            <div>
              <label for="program" style="font-weight:600;">Program</label>
              <select id="program" name="program" required style="width:100%;padding:12px;margin-top:6px;font-size:16px;">
                <option value="">Select program</option>
                <option value="playgroup">Playgroup</option>
                <option value="nursery">Nursery</option>
                <option value="lkg">Pre-Primary 1</option>
                <option value="ukg">Pre-Primary 2</option>
                <option value="daycare">Day Care</option>
              </select>
            </div>

            <div>
              <label for="message" style="font-weight:600;">Additional Message (Optional)</label>
              <textarea id="message" name="message" rows="3" style="width:100%;padding:12px;margin-top:6px;font-size:16px;"></textarea>
            </div>

            <div style="margin-top:12px;">
              <button type="submit" id="contact-submit" style="width:100%;background:#d33f5a;color:white;padding:14px;font-size:18px;border:none;border-radius:8px;cursor:pointer;">
                <span id="submit-text">${prefill.isAutoPopup ? 'Get Started' : 'Submit Inquiry'}</span>
                <span id="submit-spinner" style="display:none;margin-left:8px;">⟳</span>
              </button>
            </div>

            <p id="contact-form-success-message" style="display:none;color:#1e7f1e;font-weight:700;margin-top:12px;text-align:center;">Thank you! We'll call you soon!</p>
            <p id="contact-form-error-message" style="display:none;color:#b91c1c;font-weight:700;margin-top:12px;text-align:center;">There was an error submitting your form. Please try again or call us directly.</p>
          </form>
        </div>
      </div>
    </div>
  </div>
  `;
}

let currentModalOverlay = null;

function openContactModal(prefill = {}) {
  // If already open, ignore
  if (currentModalOverlay) return;

  const container = document.createElement('div');
  container.innerHTML = buildContactModalHTML(prefill);
  document.body.appendChild(container);

  currentModalOverlay = container.querySelector('.modal-overlay');
  if (!currentModalOverlay) return;

  // prevent background scroll
  disableBodyScroll();

  // Attach close handlers
  const closeButtons = container.querySelectorAll('.close-modal-btn');
  closeButtons.forEach(btn => btn.addEventListener('click', () => closeContactModal()));

  // Close when clicking overlay outside content
  currentModalOverlay.addEventListener('click', (e) => {
    if (e.target === currentModalOverlay) closeContactModal();
  });

  // Hook form submission
  const contactForm = container.querySelector('#contact-form');
  const successMessage = container.querySelector('#contact-form-success-message');
  const errorMessage = container.querySelector('#contact-form-error-message');
  const submitText = container.querySelector('#submit-text');
  const submitSpinner = container.querySelector('#submit-spinner');

  if (contactForm) {
    // Pre-fill if provided
    if (prefill.parentName) contactForm.querySelector('#parentName').value = prefill.parentName;
    if (prefill.phone) contactForm.querySelector('#phone').value = prefill.phone;
    if (prefill.childAge) contactForm.querySelector('#childAge').value = prefill.childAge;
    if (prefill.program) contactForm.querySelector('#program').value = prefill.program;
    if (prefill.message) contactForm.querySelector('#message').value = prefill.message;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // show loading
      submitText.style.display = 'none';
      submitSpinner.style.display = 'inline-block';
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';

      // collect form data (match uploaded html structure). 5
      const formData = {
        parentName: (document.getElementById('parentName') || {}).value || '',
        phone: (document.getElementById('phone') || {}).value || '',
        childAge: (document.getElementById('childAge') || {}).value || '',
        program: (document.getElementById('program') || {}).value || '',
        message: (document.getElementById('message') || {}).value || '',
        timestamp: new Date().toLocaleString(),
        source: prefill.isAutoPopup ? 'Auto Popup Form' : 'Website Contact Form'
      };

      // Validate minimal
      if (!formData.parentName || !formData.phone || !formData.program) {
        errorMessage.innerText = 'Please fill in required fields: name, phone, program.';
        errorMessage.style.display = 'block';
        submitText.style.display = '';
        submitSpinner.style.display = 'none';
        return;
      }

      // Send via EmailJS
      if (window.emailjs && typeof emailjs.send === 'function') {
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, formData)
          .then(function (response) {
            successMessage.style.display = 'block';
            contactForm.reset();
            submitText.style.display = '';
            submitSpinner.style.display = 'none';
            setTimeout(() => {
              closeContactModal();
            }, 2000);
          }, function (err) {
            console.error('EmailJS send error', err);
            errorMessage.style.display = 'block';
            submitText.style.display = '';
            submitSpinner.style.display = 'none';
          });
      } else {
        // fallback: show success and log
        console.warn('EmailJS not available, logging form data:', formData);
        successMessage.style.display = 'block';
        submitText.style.display = '';
        submitSpinner.style.display = 'none';
        setTimeout(closeContactModal, 1500);
      }
    });
  }
}

function closeContactModal() {
  if (!currentModalOverlay) return;
  const overlayParent = currentModalOverlay.parentElement;
  if (overlayParent) overlayParent.remove();
  currentModalOverlay = null;
  enableBodyScroll();
}

/* expose global function to open contact modal and prefill */
window.openUnifiedModal = function (opts = {}) {
  // opts: { prefillProgram, parentName, phone, childAge, message, isAutoPopup }
  const prefill = {
    program: opts.prefillProgram || opts.program || '',
    parentName: opts.parentName || '',
    phone: opts.phone || '',
    childAge: opts.childAge || '',
    message: opts.message || '',
    isAutoPopup: !!opts.isAutoPopup
  };
  openContactModal(prefill);
};

/* ========= BLOG / PROGRAM MODAL HELPERS =========
   Provide createBlogModal(container, data) or usage; pages already create their own modals.
   We ensure any .open-contact-modal elements call openUnifiedModal.
*/
function wireContactButtons() {
  document.addEventListener('click', function (e) {
    const el = e.target.closest && e.target.closest('.open-contact-modal');
    if (!el) return;
    const program = el.dataset.program || el.getAttribute('data-program') || '';
    openUnifiedModal({ prefillProgram: program });
  });
}

/* ========= TESTIMONIALS (MANUAL SLIDER, MANUAL NAV ARROWS) =========
   Remove any live review fetching. Use the 5 review objects from your uploaded file. 6
*/
const MANUAL_TESTIMONIALS = [
  { name: "Sai Ram", text: "My child has shown lot of development and he is now more confident after joining st vincent's school." },
  { name: "Latha B.", text: "St. Vincent School has excellent facilities and a clean, well-maintained campus that supports learning. The classrooms are modern and well-equipped. What truly stands out is how friendly and approachable the teachers are... One of the Best Schools in ChandaNagar" },
  { name: "Shashank Bhardwaj.", text: "My child loves going to this preschool! The teachers are caring, the environment is safe and nurturing, and I've seen amazing growth in my little one's confidence and skills." },
  { name: "Saurabh Shourie.", text: "Great environment with lesser fees in comparison to other schools nearby . My child loves the school. Highly recommended.!" },
  { name: "Anita Singha.", text: "Recently my daughter joined school and she's very happy and she's hyperactive kid so, I am happy that school is very spacious , hygienic plus we got good experienced teachers as well" }
];

function initManualTestimonialSlider() {
  const sliderRoot = document.getElementById('testimonial-slider');
  if (!sliderRoot) return;

  // Build basic markup: container, slides, arrows
  sliderRoot.innerHTML = '';
  const wrapper = createEl('div', { class: 'testimonial-wrapper', style: 'position:relative;overflow:hidden;' });
  const track = createEl('div', { class: 'testimonial-track', style: 'display:flex;transition:transform 400ms ease;' });

  // create slides
  MANUAL_TESTIMONIALS.forEach((t, idx) => {
    const slide = createEl('div', { class: 'testimonial-slide', style: 'min-width:100%;box-sizing:border-box;padding:16px;' });
    slide.innerHTML = `
      <div style="position:relative;background:#fff7eb;border-radius:12px;padding:28px;min-height:220px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 20px rgba(0,0,0,0.06);">
        <div style="flex:1;">
          <p style="color:#334155;line-height:1.5;">"${t.text}"</p>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;">
          <div style="font-weight:700;color:#0f172a;">- ${t.name}</div>
          <div style="position:relative;display:flex;align-items:center;">
            <div style="display:flex;gap:4px;margin-right:8px;">
              <i class="fas fa-star" style="color:#f59e0b"></i>
              <i class="fas fa-star" style="color:#f59e0b"></i>
              <i class="fas fa-star" style="color:#f59e0b"></i>
              <i class="fas fa-star" style="color:#f59e0b"></i>
              <i class="fas fa-star" style="color:#f59e0b"></i>
            </div>
            <!-- Google badge bottom-left inside slide - represented as a small rounded label -->
            <div style="position:absolute;left:-120px;bottom:-12px;display:none"></div>
          </div>
        </div>
      </div>
    `;
    // add google badge bottom-left inside slide (absolute)
    const badge = createEl('div', { class: 'google-badge', style: 'position:absolute;left:12px;bottom:12px;background:white;border-radius:6px;padding:6px 8px;display:flex;align-items:center;box-shadow:0 6px 12px rgba(0,0,0,0.08);' });
    badge.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="margin-right:6px"><path fill="#4285F4" d="M12 11.5V14l3-3-3-3v2.5c-4.8 0-8.6 1.5-11 4.5 2.5 3 6.4 4.5 11 4.5 3.4 0 6.4-.9 9-2.5v-3c-3.1 2-6.6 3-9 3-3.9 0-7.6-1.3-10-3.5 2.4-2.2 6.1-3.5 10-3.5z"></path></svg><span style="font-size:12px;color:#111;font-weight:700">Google</span>`;
    slide.querySelector('.testimonial-slide > div')?.appendChild(badge);
    track.appendChild(slide);
  });

  wrapper.appendChild(track);

  // arrows
  const left = createEl('button', { class: 'testimonial-left', style: 'position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:10;background:white;border-radius:999px;padding:10px;border:none;box-shadow:0 6px 14px rgba(0,0,0,0.08);cursor:pointer;' }, '<i class="fas fa-chevron-left"></i>');
  const right = createEl('button', { class: 'testimonial-right', style: 'position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:10;background:white;border-radius:999px;padding:10px;border:none;box-shadow:0 6px 14px rgba(0,0,0,0.08);cursor:pointer;' }, '<i class="fas fa-chevron-right"></i>');

  sliderRoot.appendChild(wrapper);
  sliderRoot.appendChild(left);
  sliderRoot.appendChild(right);

  // state
  let idx = 0;
  function render() {
    track.style.transform = `translateX(-${idx * 100}%)`;
  }
  left.addEventListener('click', () => {
    idx = (idx - 1 + MANUAL_TESTIMONIALS.length) % MANUAL_TESTIMONIALS.length;
    render();
  });
  right.addEventListener('click', () => {
    idx = (idx + 1) % MANUAL_TESTIMONIALS.length;
    render();
  });

  // allow swipe on mobile
  let startX = 0;
  let moving = false;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    moving = true;
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (!moving) return;
    const dx = e.touches[0].clientX - startX;
    // small threshold
    if (Math.abs(dx) > 60) {
      if (dx > 0) left.click(); else right.click();
      moving = false;
    }
  }, { passive: true });
}

/* ========= INIT ========= */
function initSiteCore() {
  ensureWhatsAppFab();
  initMobileMenu();
  wireContactButtons();
  initManualTestimonialSlider();

  // Expose small helper for pages to ensure whatsapp is present
  window.ensureWhatsAppFab = ensureWhatsAppFab;
}

document.addEventListener('DOMContentLoaded', initSiteCore);

/* ========= NOTES =========
 - Form structure and field names were taken from your uploaded html (live-output (11).html). 7
 - EmailJS config (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY) copied from the uploaded file. Make sure these stay correct in your deployment. 8
 - Testimonials used are the five manual top-5 reviews you provided in the uploaded file. 9
 - This file intentionally avoids attempting live Google API calls.
 - If you want the Google badge image to be an actual PNG, place `images/google-badge.png` and update the badge innerHTML to use an <img> tag.
*/
