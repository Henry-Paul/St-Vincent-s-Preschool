# St. Vincent's Preschool — Static PWA

## Summary
This project is a responsive, accessible static website (progressive web app) with:
- Google Maps + Places (real-time reviews)
- WhatsApp chat widget
- EmailJS contact form
- GTM ready
- PWA manifest + service worker

## Steps to configure (required)
1. **Images**: add the `images/` folder and subfolders (gallery, blog) as discussed earlier.
2. **Google Maps API Key**:
   - Go to Google Cloud Console → create/choose project → enable **Maps JavaScript API** and **Places API**.
   - Create an API key, restrict it to your domain (recommended), and paste it into `index.html` where indicated (`YOUR_GOOGLE_MAPS_API_KEY_HERE`).
3. **Place ID**:
   - Open Google's Place ID Finder: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
   - Find your business, copy the Place ID and paste it into `js/main.js` `CONFIG.PLACE_ID`.
4. **GTM**:
   - Create a container at https://tagmanager.google.com, get your container ID (GTM-XXXX) and replace the placeholder in `index.html`.
5. **EmailJS**:
   - If you want to keep the sample keys, they are already in `js/main.js`.
   - Or create your EmailJS service & template and replace `CONFIG.EMAILJS` values.
6. **Deploy**:
   - Push to GitHub.
   - GitHub Pages: repo → Settings → Pages → Branch `main` (root).
   - Wait ~1 minute and open `https://<username>.github.io/<repo>/`.
7. **PWA install**:
   - Visit site on mobile Chrome/Safari; install prompt will appear; service worker caches basic assets.

## Notes about Google Reviews
- Google Places client-side `getDetails` provides reviews but **Google commonly returns up to 5 reviews** for non-owner requests. If you need more or full history, consider owner-level APIs or third-party review aggregator services. (See developer docs and limitations in README.) 

## Accessibility checks
- Run Lighthouse (Chrome DevTools) and WAVE (https://wave.webaim.org/) and fix flagged issues (all pages have ARIA landmarks, alt text, visible focus states, and keyboard accessible modals).
