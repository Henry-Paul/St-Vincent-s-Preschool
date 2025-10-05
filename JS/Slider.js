// Testimonial Slider functionality
class TestimonialSlider {
    constructor() {
        this.slider = document.getElementById('testimonial-slider');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.slider) return;
        
        this.renderTestimonials();
        this.setupEventListeners();
        this.startAutoPlay();
    }
    
    renderTestimonials() {
        this.slider.innerHTML = window.appConfig.testimonials.map(t => `
            <div class="testimonial-slide p-4 flex-shrink-0">
                <div class="bg-yellow-100 p-8 rounded-xl crayon-border">
                    <p class="font-body text-gray-600 testimonial-text">"${t.text}"</p>
                    <p class="font-bold text-gray-800 mt-6 text-2xl text-right">- ${t.name}</p>
                </div>
            </div>
        `).join('');
    }
    
    updateSlider() {
        this.slider.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % window.appConfig.testimonials.length;
        this.updateSlider();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + window.appConfig.testimonials.length) % window.appConfig.testimonials.length;
        this.updateSlider();
    }
    
    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => this.next());
        document.getElementById('prevBtn').addEventListener('click', () => this.prev());
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Image Slider functionality
class ImageSlider {
    constructor() {
        this.slider = document.getElementById('image-slider');
        this.dots = document.querySelectorAll('.slider-dot');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.slider) return;
        
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateSlider();
    }
    
    updateSlider() {
        this.slider.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.dots.length;
        this.updateSlider();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.dots.length) % this.dots.length;
        this.updateSlider();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
    
    setupEventListeners() {
        document.getElementById('slider-next').addEventListener('click', () => this.next());
        document.getElementById('slider-prev').addEventListener('click', () => this.prev());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.next(), 4000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialSlider();
    new ImageSlider();
});
