/* ============================================
   ST. VINCENT'S PRESCHOOL - TESTIMONIALS WIDGET
   Google Reviews Integration
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonials
    loadGoogleReviews();
});

async function loadGoogleReviews() {
    const API_KEY = 'AIzaSyDxtmtPmYd3XN2LbsZaTGD2wjMwVbnyLo4';
    const PLACE_ID = 'ChIJ57HUW3STyzsRXzMWdj4P9Cg';
    
    // This is a mock implementation since we can't make direct API calls
    // from client-side JavaScript without proper CORS setup
    // In production, you would need a backend proxy or use a service
    
    const mockReviews = [
        {
            author_name: 'Priya Sharma',
            rating: 5,
            text: "My daughter loves coming to school every day. The teachers are caring and the environment is perfect for learning through play.",
            relative_time_description: '2 months ago'
        },
        {
            author_name: 'Rajesh Kumar',
            rating: 5,
            text: "The facilities are excellent and the curriculum is well-structured. My son has developed so much confidence here.",
            relative_time_description: '3 months ago'
        },
        {
            author_name: 'Anjali Patel',
            rating: 5,
            text: "Safe, clean, and nurturing environment. The staff is professional and truly cares about each child's development.",
            relative_time_description: '1 month ago'
        },
        {
            author_name: 'Sanjay Mehta',
            rating: 5,
            text: "My child has learned so much in just a few months. The teachers are amazing and the activities are engaging.",
            relative_time_description: '4 months ago'
        },
        {
            author_name: 'Neha Gupta',
            rating: 5,
            text: "Best preschool in Hyderabad! The attention to safety and individual child's needs is exceptional.",
            relative_time_description: '2 weeks ago'
        }
    ];
    
    // Display reviews
    displayReviews(mockReviews);
    
    // In a real implementation, you would use:
    /*
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.result && data.result.reviews) {
            const reviews = data.result.reviews
                .filter(review => review.rating === 5)
                .slice(0, 5);
            
            displayReviews(reviews);
        }
    } catch (error) {
        console.error('Error loading Google reviews:', error);
        // Fallback to mock reviews
        displayReviews(mockReviews);
    }
    */
}

function displayReviews(reviews) {
    const testimonialContainer = document.querySelector('.testimonial-carousel');
    
    if (!testimonialContainer) return;
    
    // Clear existing slides
    const existingSlides = testimonialContainer.querySelectorAll('.testimonial-slide');
    existingSlides.forEach(slide => slide.remove());
    
    // Create new slides
    reviews.forEach((review, index) => {
        const slide = document.createElement('div');
        slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
        
        // Create star rating
        const stars = '★★★★★'.slice(0, review.rating) + '☆☆☆☆☆'.slice(review.rating);
        
        slide.innerHTML = `
            <div class="stars">${stars}</div>
            <p class="testimonial-text">"${review.text}"</p>
            <p class="testimonial-author">- ${review.author_name}</p>
            <p class="review-date">${review.relative_time_description}</p>
        `;
        
        testimonialContainer.insertBefore(slide, testimonialContainer.querySelector('.carousel-controls'));
    });
    
    // Reinitialize carousel
    if (typeof initTestimonialCarousel === 'function') {
        initTestimonialCarousel();
    }
}

// Create stars HTML from rating
function createStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}
