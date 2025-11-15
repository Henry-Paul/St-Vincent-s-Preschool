// js/main.js — copy/paste exactly

/* ========== CONFIG - update these ========== */
const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_14zrdg6',   // from your uploaded file (or replace with your own)
    TEMPLATE_ID: 'template_snxhxlk',
    PUBLIC_KEY: '5SyxCT8kGY0_H51dC'
  },
  // Replace with your placeId (find via Place ID Finder or Maps Platform)
  PLACE_ID: 'YOUR_PLACE_ID_HERE',
  WHATSAPP_NUMBER: '919032249494' // country code + number (no +)
};
/* ========================================== */

/* EmailJS init */
if (window.emailjs) emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);

/* helpers */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ===== Mobile menu ===== */
(function menuSetup(){
  const menuToggle = document.querySelectorAll('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  menuToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(isHidden));
    });
  });
})();

/* ===== Modal open/close (data attributes) ===== */
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open-modal]');
  if (open) {
    const id = open.getAttribute('data-open-modal');
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  const close = e.target.closest('[data-close-modal]');
  if (close) {
    const modal = close.closest('.modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
});

/* Close modal on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(m => {
      m.classList.add('hidden');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }
});

/* ===== Contact form (modal) ===== */
(function contactModal(){
  const form = $('#contact-modal-form');
  const status = $('#modal-status');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Sending...';

    const payload = {
      parentName: form.parentName?.value || form.querySelector('#c-name')?.value || '',
      phone: form.phone?.value || form.querySelector('#c-phone')?.value || '',
      childAge: form.childAge?.value || form.querySelector('#c-age')?.value || '',
      message: form.message?.value || form.querySelector('#c-message')?.value || '',
      timestamp: new Date().toLocaleString()
    };

    if (!payload.parentName || !payload.phone) {
      status.textContent = 'Please add name and phone.';
      return;
    }

    // call EmailJS
    emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, payload)
      .then(() => {
        status.textContent = 'Thanks — we will contact you soon!';
        form.reset();
        setTimeout(()=> {
          const modal = form.closest('.modal');
          if(modal){ modal.classList.add('hidden'); document.body.style.overflow = ''; }
          status.textContent = '';
        }, 1400);
      }).catch((err)=> {
        console.error('EmailJS error', err);
        status.textContent = 'Could not send; try again later.';
      });
  });
})();

/* ===== WhatsApp chat mini-widget ===== */
(function waWidget(){
  const open = $('#wa-open');
  const panel = $('#wa-panel');
  const sendBtn = $('#wa-send');
  const suggestions = Array.from(document.querySelectorAll('.wa-suggest'));
  let selected = suggestions[0]?.dataset.msg || 'Hi, I would like to know about admissions.';

  suggestions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      selected = e.currentTarget.dataset.msg;
      // visual focus
      suggestions.forEach(s => s.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
    });
  });

  open?.addEventListener('click', () => {
    panel?.classList.toggle('hidden');
  });

  sendBtn?.addEventListener('click', () => {
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(selected)}`;
    window.open(url, '_blank');
  });
})();

/* ===== Map + Reviews using PlacesService (client-side) =====
   - Requires the Maps JS API loaded with &libraries=places
   - We create a map (hidden) and call getDetails to retrieve reviews
   - Google Places returns a limited number of reviews (often up to 5) for public requests.
   - If no reviews or access denied, we show a friendly fallback with link to Google listing.
   Docs: https://developers.google.com/maps/documentation/javascript/reference/places-service
*/
let map, placesService;
function initMap() {
  // default center (fallback)
  const center = { lat: 17.4447, lng: 78.3432 }; // approximate Hyderabad
  map = new google.maps.Map(document.getElementById('map'), {
    center,
    zoom: 16,
    disableDefaultUI: true,
    gestureHandling: 'cooperative'
  });

  placesService = new google.maps.places.PlacesService(map);

  // Try to place marker for our PLACE_ID if provided, else geocode / textSearch could be used.
  if (CONFIG.PLACE_ID && CONFIG.PLACE_ID !== 'YOUR_PLACE_ID_HERE') {
    const request = { placeId: CONFIG.PLACE_ID, fields: ['name','formatted_address','geometry','rating','user_ratings_total','reviews','url'] };
    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        map.setCenter(place.geometry.location);
        const marker = new google.maps.Marker({ map, position: place.geometry.location, title: place.name });
        const info = new google.maps.InfoWindow({ content: `<strong>${place.name}</strong><div>${place.formatted_address}</div><a href="${place.url}" target="_blank" rel="noopener">Open on Google</a>`});
        marker.addListener('click', ()=> info.open(map, marker));

        // Populate reviews
        renderReviewsFromPlace(place);
      } else {
        // fallback: show a message and try to load via text search later
        document.getElementById('reviews-container').innerHTML = `<div class="text-sm text-gray-600">Reviews are unavailable right now. <a href="#" target="_blank">Check our Google listing</a>.</div>`;
        console.warn('PlacesService.getDetails status', status);
      }
    });
  } else {
    document.getElementById('reviews-container').innerHTML = `<div class="text-sm text-gray-600">No Place ID configured. Add your business Place ID in js/main.js to show Google reviews.</div>`;
  }

  // Hook the "Show on Map" button to center map and open info
  document.getElementById('map-focus-btn')?.addEventListener('click', ()=> {
    window.scrollTo({ top: document.getElementById('map').offsetTop - 80, behavior: 'smooth' });
  });
}

/* Render reviews provided by Place Details result */
function renderReviewsFromPlace(place) {
  const container = document.getElementById('reviews-container');
  container.innerHTML = ''; // clear loading
  if (place.reviews && place.reviews.length) {
    const reviewsHTML = place.reviews.map(r => {
      // rating, author_name, relative_time_description, text
      return `<div class="p-4 border rounded bg-[#fff7f1]">
        <div class="flex items-center gap-3">
          <div class="text-lg font-semibold">${escapeHtml(r.author_name || 'User')}</div>
          <div class="ml-auto text-sm text-gray-600">${'★'.repeat(Math.round(r.rating || 0))}</div>
        </div>
        <div class="text-sm text-gray-700 mt-2">${escapeHtml(r.text || '')}</div>
        <div class="text-xs text-gray-500 mt-2">${escapeHtml(r.relative_time_description || '')}</div>
      </div>`;
    }).join('');
    container.innerHTML = reviewsHTML;
    // If Google returned fewer than the total on the place, show a link to Google listing
    if (place.user_ratings_total && place.reviews.length < place.user_ratings_total) {
      const more = document.createElement('div');
      more.className = 'mt-2 text-sm';
      more.innerHTML = `<a href="${place.url || '#'}" target="_blank" rel="noopener">Read more reviews on Google Maps (${place.user_ratings_total} total)</a>`;
      container.appendChild(more);
    }
  } else {
    container.innerHTML = `<div class="text-sm text-gray-600">No reviews found. <a href="${place.url || '#'}" target="_blank">View on Google Maps</a></div>`;
  }
}

/* small HTML escape helper */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

/* ===== PWA service-worker registration ===== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      console.log('Service worker registered:', reg.scope);
    }).catch(err => console.warn('Service worker registration failed:', err));
  });
}
