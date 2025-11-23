/* ======================================================
   GOOGLE REVIEWS TESTIMONIAL WIDGET - FINAL WORKING VERSION
   ====================================================== */

const GOOGLE_API_KEY = "AIzaSyDxtmtPmYd3XN2LbsZaTGD2wjMwVbnyLo4";
const GOOGLE_PLACE_ID = "ChIJ57HUW3STyzsRXzMWdj4P9Cg";

const twTrack = document.getElementById("tw-track");
const btnPrev = document.getElementById("tw-prev");
const btnNext = document.getElementById("tw-next");

let testimonials = [];
let currentIndex = 0;

// Fetch reviews from Google Places API
async function loadGoogleReviews() {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=review&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.result || !data.result.reviews) {
            console.error("No reviews found. Check API key & Place ID.");
            return;
        }

        // Top 5 reviews sorted by rating
        testimonials = data.result.reviews
            .filter(r => r.rating === 5)
            .slice(0, 5);

        renderTestimonials();

    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

// Build testimonial cards dynamically
function renderTestimonials() {
    twTrack.innerHTML = "";

    testimonials.forEach((review, index) => {
        const card = document.createElement("div");
        card.className = "tw-item";
        card.style.transform = `translateX(${index * 100}%)`;

        card.innerHTML = `
            <div class="tw-content">
                <p class="tw-text">“${review.text}”</p>
                <div class="tw-author">${review.author_name}</div>

                <div class="tw-stars">★★★★★</div>

                <div class="tw-badge-small">
                    <img src="images/google-badge.png" alt="Google rating badge">
                </div>
            </div>
        `;

        twTrack.appendChild(card);
    });
}

// Slide to next testimonial
function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateSlider();
}

// Slide to previous testimonial
function prevTestimonial() {
    currentIndex =
        (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateSlider();
}

// Apply slider transform
function updateSlider() {
    document.querySelectorAll(".tw-item").forEach((item, i) => {
        item.style.transform = `translateX(${100 * (i - currentIndex)}%)`;
    });
}

// Button listeners
btnNext.addEventListener("click", nextTestimonial);
btnPrev.addEventListener("click", prevTestimonial);

// Auto-slide every 7s
setInterval(nextTestimonial, 7000);

// Run on load
loadGoogleReviews();
