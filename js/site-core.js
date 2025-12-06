/* ============================================
   ST. VINCENT'S PRESCHOOL - MAIN JAVASCRIPT
   Complete functionality for all pages
   ============================================ */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('St. Vincent\'s Preschool - Site Loaded');
    
    // Initialize all components
    initMobileMenu();
    initTestimonialCarousel();
    initImageSlider();
    initGalleryFilter();
    initFAQAccordion();
    initFAQSearch();
    initFAQCategories();
    initContactForm();
    initProgramPreSelect();
    initNewsletterForm();
    initScheduleButtons();
    
    // Add smooth scroll for anchor links
    initSmoothScroll();
    
    // Update copyright year
    updateCopyrightYear();
});

/* ========== MOBILE MENU ========== */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    
    if (!menuToggle || !mobileMenu) return;
    
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
        
        // Toggle body scroll
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking on links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

/* ========== TESTIMONIAL CAROUSEL ========== */
function initTestimonialCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    // Show first slide
    showSlide(currentSlide);
    
    // Auto rotate every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto-rotate on hover
    const carousel = document.querySelector('.testimonial-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
}

/* ========== IMAGE SLIDER ========== */
function initImageSlider() {
    const slider = document.getElementById('imageSlider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dots = document.querySelectorAll('.dot');
    
    if (!slider || slides.length === 0) return;
    
    const track = slider.querySelector('.slider-track');
    let currentIndex = 0;
    
    // Initialize slider
    updateSlider();
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        }
    });
    
    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                currentIndex = (currentIndex + 1) % slides.length;
            } else {
                // Swipe right - previous slide
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            }
            updateSlider();
        }
    }
    
    function updateSlider() {
        // Move track
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
}

/* ========== GALLERY FILTER ========== */
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ========== FAQ ACCORDION ========== */
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length === 0) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Close all other FAQ items
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.classList.remove('active');
                    q.nextElementSibling.classList.remove('active');
                    q.nextElementSibling.style.maxHeight = null;
                }
            });
            
            // Toggle current FAQ item
            this.classList.toggle('active');
            
            if (!isActive) {
                answer.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });
}

/* ========== FAQ SEARCH ========== */
function initFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (searchTerm === '') {
            // Show all FAQ items
            faqItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                
                // Highlight matching text
                highlightText(item, searchTerm);
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    function highlightText(element, searchTerm) {
        const questionSpan = element.querySelector('.faq-question span');
        const answer = element.querySelector('.faq-answer');
        
        // Remove previous highlights
        const highlightedSpans = element.querySelectorAll('.highlight');
        highlightedSpans.forEach(span => {
            const parent = span.parentNode;
            parent.replaceChild(document.createTextNode(span.textContent), span);
            parent.normalize();
        });
        
        // Highlight in question
        if (questionSpan) {
            highlightInElement(questionSpan, searchTerm);
        }
        
        // Highlight in answer
        if (answer) {
            highlightInElement(answer, searchTerm);
        }
    }
    
    function highlightInElement(element, searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const html = element.innerHTML;
        
        if (regex.test(html)) {
            element.innerHTML = html.replace(regex, '<span class="highlight" style="background-color: #FFE4E8; color: #8b2b58; padding: 2px 4px; border-radius: 4px;">$1</span>');
        }
    }
}

/* ========== FAQ CATEGORIES ========== */
function initFAQCategories() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (categoryButtons.length === 0) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide FAQ categories
            const faqCategories = document.querySelectorAll('.faq-category');
            
            if (category === 'all') {
                faqCategories.forEach(cat => {
                    cat.style.display = 'block';
                });
            } else {
                faqCategories.forEach(cat => {
                    if (cat.id === `category-${category}`) {
                        cat.style.display = 'block';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            }
        });
    });
}

/* ========== CONTACT FORM ========== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Form validation functions
    function validateName(name) {
        return name.length >= 2;
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        // Indian phone number validation: 10 digits, starts with 6-9
        const phoneRegex = /^[6-9]\d{9}$/;
        const digits = phone.replace(/\D/g, '');
        return phoneRegex.test(digits);
    }
    
    function validateProgram(program) {
        return program !== '';
    }
    
    function validateMessage(message) {
        return message.length >= 10;
    }
    
    // Show error message
    function showError(inputId, message) {
        const errorElement = document.getElementById(inputId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    // Hide error message
    function hideError(inputId) {
        const errorElement = document.getElementById(inputId + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    // Show success message
    function showSuccess() {
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        if (successElement) {
            successElement.classList.remove('hidden');
        }
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        if (submitText) {
            submitText.textContent = 'Send Message';
        }
        if (submitSpinner) {
            submitSpinner.classList.add('hidden');
        }
    }
    
    // Show error message
    function showFormError(message) {
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        if (errorElement) {
            errorElement.querySelector('p').textContent = message || 'There was an error sending your message. Please try again.';
            errorElement.classList.remove('hidden');
        }
        if (successElement) {
            successElement.classList.add('hidden');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        if (submitText) {
            submitText.textContent = 'Send Message';
        }
        if (submitSpinner) {
            submitSpinner.classList.add('hidden');
        }
    }
    
    // Real-time validation
    const inputs = ['name', 'email', 'phone', 'program', 'message'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                validateField(inputId);
            });
            
            input.addEventListener('input', function() {
                hideError(inputId);
            });
        }
    });
    
    function validateField(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return true;
        
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (inputId) {
            case 'name':
                isValid = validateName(value);
                errorMessage = 'Please enter a valid name (minimum 2 characters)';
                break;
            case 'email':
                isValid = validateEmail(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'phone':
                isValid = validatePhone(value);
                errorMessage = 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
                break;
            case 'program':
                isValid = validateProgram(value);
                errorMessage = 'Please select a program';
                break;
            case 'message':
                isValid = validateMessage(value);
                errorMessage = 'Please enter a message (minimum 10 characters)';
                break;
        }
        
        if (!isValid) {
            showError(inputId, errorMessage);
            return false;
        } else {
            hideError(inputId);
            return true;
        }
    }
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(inputId => {
            if (!validateField(inputId)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            program: document.getElementById('program').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Sending...';
        if (submitSpinner) submitSpinner.classList.remove('hidden');
        
        // Hide any previous messages
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');
        if (successElement) successElement.classList.add('hidden');
        if (errorElement) errorElement.classList.add('hidden');
        
        try {
            // Send email via EmailJS
            const response = await emailjs.send(
                'service_up2vw5t',     // Service ID
                'template_s7ly8in',    // Template ID
                {
                    to_email: 'Stvincent.school25@gmail.com',
                    from_name: formData.name,
                    from_email: formData.email,
                    phone: formData.phone,
                    program: formData.program,
                    message: formData.message
                }
            );
            
            console.log('Email sent successfully:', response);
            
            // Show success message
            showSuccess();
            
            // Reset form
            contactForm.reset();
            
            // Scroll to success message
            setTimeout(() => {
                const successElement = document.getElementById('formSuccess');
                if (successElement) {
                    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            
        } catch (error) {
            console.error('Error sending email:', error);
            showFormError('Failed to send message. Please try again or call us directly.');
        }
    });
}

/* ========== PROGRAM PRE-SELECTION ========== */
function initProgramPreSelect() {
    // Check if there's a program parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const programParam = urlParams.get('program');
    
    if (programParam && document.getElementById('program')) {
        const programSelect = document.getElementById('program');
        
        // Find the matching option
        for (let i = 0; i < programSelect.options.length; i++) {
            if (programSelect.options[i].value === programParam) {
                programSelect.value = programParam;
                break;
            }
        }
    }
}

/* ========== NEWSLETTER FORM ========== */
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email || !validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // In a real implementation, you would send this to your newsletter service
        alert('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
    });
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

/* ========== SCHEDULE BUTTONS ========== */
function initScheduleButtons() {
    const whatsappScheduleBtn = document.getElementById('whatsappSchedule');
    
    if (whatsappScheduleBtn) {
        whatsappScheduleBtn.addEventListener('click', function() {
            const message = encodeURIComponent('Hi St. Vincent\'s Preschool - I would like to schedule a visit to your preschool.');
            window.open(`https://wa.me/919032249494?text=${message}`, '_blank');
        });
    }
}

/* ========== SMOOTH SCROLL ========== */
function initSmoothScroll() {
    // Select all links with hashes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                const menuToggle = document.getElementById('menuToggle');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Adjust for header
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========== UPDATE COPYRIGHT YEAR ========== */
function updateCopyrightYear() {
    const copyrightElements = document.querySelectorAll('.footer-bottom p');
    const currentYear = new Date().getFullYear();
    
    copyrightElements.forEach(element => {
        element.innerHTML = element.innerHTML.replace(/2025/g, currentYear);
    });
}

/* ========== LOAD MORE ARTICLES ========== */
// This would be implemented when you have more articles to load dynamically
function initLoadMoreArticles() {
    const loadMoreBtn = document.getElementById('loadMore');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // In a real implementation, you would load more articles from a server
            alert('More articles would be loaded here in a real implementation.');
        });
    }
}
