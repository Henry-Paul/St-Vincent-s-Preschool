// Form submission handler for Formspree
class FormHandler {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupFormSubmission();
    }
    
    setupFormSubmission() {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contact-form') {
                e.preventDefault();
                this.handleContactForm(e.target);
            }
        });
    }
    
    async handleContactForm(form) {
        const submitText = form.querySelector('#submit-text');
        const submitSpinner = form.querySelector('#submit-spinner');
        const successMessage = form.querySelector('#contact-form-success-message');
        const errorMessage = form.querySelector('#contact-form-error-message');
        
        // Show loading state
        submitText.classList.add('hidden');
        submitSpinner.classList.remove('hidden');
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Collect form data for Formspree
        const formData = new FormData();
        formData.append('parentName', form.querySelector('#parentName').value);
        formData.append('phone', form.querySelector('#phone').value);
        formData.append('childAge', form.querySelector('#childAge').value);
        formData.append('program', form.querySelector('#program').value);
        formData.append('message', form.querySelector('#message').value);
        formData.append('_subject', 'New Preschool Inquiry - St. Vincent\'s');
        
        try {
            await this.submitToFormspree(formData);
            
            // Show success message
            successMessage.classList.remove('hidden');
            form.reset();
            
            // Reset button state
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
            
            // Close modal after success
            setTimeout(() => {
                const overlay = form.closest('.modal-overlay');
                if (overlay && window.modalManager) {
                    window.modalManager.closeModal(overlay);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            errorMessage.classList.remove('hidden');
            
            // Reset button state
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
        }
    }
    
    async submitToFormspree(formData) {
        // Replace 'your-formspree-id' with your actual Formspree form ID
        const response = await fetch('https://formspree.io/f/your-formspree-id', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Form submission failed');
        }
        
        return await response.json();
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});
