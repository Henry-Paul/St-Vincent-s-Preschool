// Enhanced site-core.js with futuristic features and bug fixes
document.addEventListener('DOMContentLoaded', function() {
    console.log('St. Vincent\'s Preschool - Futuristic Edition v2.0');
    
    // Initialize all components
    initThemeSystem();
    initMobileMenu();
    initSmoothScroll();
    initGallery();
    initFormValidation();
    initAnimations();
    initWhatsAppFAB();
    initAnalytics();
    initLazyLoading();
    initServiceWorker();
});

// Theme System
function initThemeSystem() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Animate theme transition
        document.documentElement.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    });
}

// Mobile Menu with Gesture Support
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuBtn || !mobileMenu) return;
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Open/Close with buttons
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        menuBtn.setAttribute('aria-expanded', 'true');
    });
    
    closeBtn.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
        menuBtn.setAttribute('aria-expanded', 'false');
    });
    
    // Close on backdrop click
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Swipe to close on mobile
    const menuContent = mobileMenu.querySelector('div > div');
    
    menuContent.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    menuContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        if (diff > 0) {
            menuContent.style.transform = `translateX(-${diff}px)`;
        }
    });
    
    menuContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        if (currentX < startX - 100) {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
        
        menuContent.style.transform = '';
        startX = 0;
        currentX = 0;
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Enhanced Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            const headerHeight = document.querySelector('.cyber-header')?.offsetHeight || 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition - headerHeight;
            const duration = 1000;
            let startTime = null;
            
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                // Easing function
                const ease = progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                window.scrollTo(0, startPosition + distance * ease);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                } else {
                    // Focus the target for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    setTimeout(() => targetElement.removeAttribute('tabindex'), 1000);
                }
            }
            
            requestAnimationFrame(animation);
        });
    });
}

// Futuristic Gallery with 3D Effects
function initGallery() {
    const gallery = document.querySelector('.holographic-gallery');
    if (!gallery) return;
    
    const slides = gallery.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Create navigation if not exists
    const nav = document.createElement('div');
    nav.className = 'gallery-nav flex justify-center gap-4 mt-6';
    nav.innerHTML = `
        <button class="gallery-prev btn-futuristic">
            <i class="fas fa-chevron-left"></i>
        </button>
        <div class="gallery-dots flex gap-2"></div>
        <button class="gallery-next btn-futuristic">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    gallery.appendChild(nav);
    
    // Create dots
    const dotsContainer = nav.querySelector('.gallery-dots');
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-600' : 'bg-gray-300'}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Navigation functions
    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        
        // Animate slides
        slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${(i - currentSlide) * 100}%)`;
            slide.style.opacity = i === currentSlide ? '1' : '0.3';
            slide.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        // Update dots
        dotsContainer.querySelectorAll('button').forEach((dot, i) => {
            dot.className = `w-3 h-3 rounded-full ${i === currentSlide ? 'bg-purple-600' : 'bg-gray-300'}`;
        });
    }
    
    // Event listeners
    nav.querySelector('.gallery-prev').addEventListener('click', () => {
        goToSlide(currentSlide - 1);
    });
    
    nav.querySelector('.gallery-next').addEventListener('click', () => {
        goToSlide(currentSlide + 1);
    });
    
    // Auto-advance
    let autoSlide = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000);
    
    // Pause on hover
    gallery.addEventListener('mouseenter', () => clearInterval(autoSlide));
    gallery.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    });
    
    // Initialize
    goToSlide(0);
}

// Advanced Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
            
            // Add validation patterns
            if (input.type === 'tel') {
                input.pattern = '[0-9]{10}';
                input.title = 'Please enter a valid 10-digit phone number';
            }
            
            if (input.type === 'email') {
                input.pattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
                input.title = 'Please enter a valid email address';
            }
        });
        
        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) return;
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
            submitBtn.disabled = true;
            
            try {
                // Collect form data
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                // Add metadata
                data.timestamp = new Date().toISOString();
                data.pageUrl = window.location.href;
                data.userAgent = navigator.userAgent;
                
                // Send to server (replace with your endpoint)
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showSuccessMessage(this, 'Thank you! We\'ll contact you soon.');
                    this.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                showErrorMessage(this, 'Something went wrong. Please try again or call us directly.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    });
    
    function validateField(e) {
        const input = e.target;
        const isValid = input.checkValidity();
        
        if (!isValid) {
            showInputError(input, input.validationMessage);
        } else {
            clearError(input);
        }
        
        return isValid;
    }
    
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function showInputError(input, message) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message text-red-500 text-sm mt-1';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('border-red-500');
        input.classList.remove('border-green-500');
    }
    
    function clearError(input) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('border-red-500');
        input.classList.add('border-green-500');
    }
    
    function showSuccessMessage(form, message) {
        let successElement = form.querySelector('.success-message');
        
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success-message';
            form.insertBefore(successElement, form.firstChild);
        }
        
        successElement.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                <div class="flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        setTimeout(() => successElement.remove(), 5000);
    }
    
    function showErrorMessage(form, message) {
        let errorElement = form.querySelector('.form-error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error-message';
            form.insertBefore(errorElement, form.firstChild);
        }
        
        errorElement.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        setTimeout(() => errorElement.remove(), 5000);
    }
}

// Animation System
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right').forEach(el => {
        observer.observe(el);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-up {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-up.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .slide-in-left {
            opacity: 0;
            transform: translateX(-30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .slide-in-left.animate-in {
            opacity: 1;
            transform: translateX(0);
        }
        
        .slide-in-right {
            opacity: 0;
            transform: translateX(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .slide-in-right.animate-in {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
}

// Futuristic WhatsApp FAB
function initWhatsAppFAB() {
    if (document.getElementById('whatsapp-fab')) return;
    
    const fab = document.createElement('a');
    fab.id = 'whatsapp-fab';
    fab.href = 'https://wa.me/919032249494?text=Hello! I am interested in St. Vincent\'s Preschool programs.';
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.setAttribute('aria-label', 'Chat on WhatsApp');
    
    fab.innerHTML = `
        <div class="whatsapp-fab-inner">
            <i class="fab fa-whatsapp"></i>
            <span class="whatsapp-tooltip">Chat with us!</span>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        #whatsapp-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #25D366, #128C7E);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            overflow: hidden;
        }
        
        #whatsapp-fab:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 8px 30px rgba(37, 211, 102, 0.6);
        }
        
        #whatsapp-fab::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        #whatsapp-fab:hover::before {
            opacity: 1;
        }
        
        .whatsapp-tooltip {
            position: absolute;
            bottom: 70px;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s;
            pointer-events: none;
        }
        
        #whatsapp-fab:hover .whatsapp-tooltip {
            opacity: 1;
            transform: translateY(0);
        }
        
        @media (max-width: 768px) {
            #whatsapp-fab {
                bottom: 16px;
                right: 16px;
                width: 56px;
                height: 56px;
                font-size: 24px;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(fab);
}

// Analytics (Privacy-focused)
function initAnalytics() {
    // Only track if user consents (GDPR compliant)
    if (localStorage.getItem('analytics-consent') !== 'true') return;
    
    // Simple pageview tracking
    const pageviewData = {
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    // Send to your analytics endpoint
    fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageviewData)
    }).catch(() => {
        // Silent fail for analytics
    });
}

// Lazy Loading for Images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Service Worker Registration
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

// Global Modal System
function openUnifiedModal(options = {}) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-9999 flex items-center justify-center p-4';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-white rounded-2xl p-8 max-w-lg w-full transform transition-all duration-300 scale-95 opacity-0">
            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onclick="this.closest('[role=dialog]').remove()">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <h2 id="modal-title" class="text-2xl font-bold mb-6">Schedule a Futuristic Tour</h2>
            
            <form id="tour-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Your Name</label>
                    <input type="text" required class="cyber-input" name="name">
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" required class="cyber-input" name="phone" pattern="[0-9]{10}">
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Child's Age</label>
                    <select class="cyber-input" name="age" required>
                        <option value="">Select Age</option>
                        <option value="1.5-2">1.5 - 2 years</option>
                        <option value="2-3">2 - 3 years</option>
                        <option value="3-4">3 - 4 years</option>
                        <option value="4-5">4 - 5 years</option>
                        <option value="5-6">5 - 6 years</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Program Interest</label>
                    <select class="cyber-input" name="program" required>
                        <option value="">Select Program</option>
                        <option ${options.program === 'AI Playgroup' ? 'selected' : ''}>AI Playgroup</option>
                        <option ${options.program === 'Cyber Nursery' ? 'selected' : ''}>Cyber Nursery</option>
                        <option ${options.program === 'VR Pre-Primary' ? 'selected' : ''}>VR Pre-Primary</option>
                        <option value="Day Care">Day Care</option>
                    </select>
                </div>
                
                <button type="submit" class="btn-futuristic btn-futuristic-primary w-full">
                    <i class="fas fa-paper-plane mr-2"></i>Submit Request
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        const modalContent = modal.querySelector('.relative');
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // Handle form submission
    modal.querySelector('#tour-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Form submission logic here
    });
    
    // Close on Escape
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Export for global use
window.openUnifiedModal = openUnifiedModal;

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData && perfData.loadEventEnd) {
                console.log(`Page loaded in ${perfData.loadEventEnd.toFixed(2)}ms`);
            }
        }, 0);
    });
}
