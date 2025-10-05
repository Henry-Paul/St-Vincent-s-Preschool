// Modal management system
class ModalManager {
    constructor() {
        this.modals = {};
        this.init();
    }
    
    init() {
        this.setupProgramModals();
        this.setupBlogModals();
        this.setupContactModalTriggers();
        
        // Auto-open contact modal after 5 seconds
        setTimeout(() => {
            this.createContactModal();
        }, 5000);
    }
    
    setupProgramModals() {
        document.querySelectorAll('.program-card').forEach(card => {
            card.addEventListener('click', () => {
                const program = card.dataset.program;
                this.createProgramModal(program);
            });
        });
    }
    
    setupBlogModals() {
        document.querySelectorAll('.open-blog-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const blogId = btn.getAttribute('data-blog');
                this.createBlogModal(blogId);
            });
        });
    }
    
    setupContactModalTriggers() {
        const triggers = [
            'open-contact-modal',
            'open-contact-modal-mobile',
            'open-contact-modal-hero',
            'open-contact-modal-bottom'
        ];
        
        triggers.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => this.createContactModal());
            }
        });
        
        document.querySelector('.open-contact-modal-premium').addEventListener('click', () => this.createContactModal());
    }
    
    createProgramModal(programId) {
        const data = window.appConfig.programData[programId];
        if (!data) return;
        
        this.createModal(data, 'program');
    }
    
    createContactModal() {
        this.createModal({}, 'contact');
    }
    
    createBlogModal(blogId) {
        const data = window.appConfig.blogData[blogId];
        if (!data) return;
        
        const blogDataWithColor = {
            ...data,
            color: blogId === 'science' ? 'blue' : blogId === 'social' ? 'green' : 'purple'
        };
        
        this.createModal(blogDataWithColor, 'blog');
    }
    
    createModal(data, type) {
        const containerId = `${type}-modal-container`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        const modalHTML = this.generateModalHTML(data, type);
        container.innerHTML = modalHTML;
        
        const overlay = container.querySelector('.modal-overlay');
        overlay.style.display = 'flex';
        
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            overlay.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
        
        lucide.createIcons();
        this.setupModalEvents(overlay, type);
    }
    
    generateModalHTML(data, type) {
        const templates = {
            program: this.programModalTemplate,
            contact: this.contactModalTemplate,
            blog: this.blogModalTemplate
        };
        
        return templates[type].call(this, data);
    }
    
    programModalTemplate(data) {
        return `
        <div class="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 opacity-0" style="display: none;">
            <div class="modal-content bg-paper crayon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h2 class="text-5xl font-bold text-gray-800">${data.title}</h2>
                            <p class="text-2xl text-${data.color}-600 font-semibold mt-1">${data.hook}</p>
                        </div>
                        <button class="close-modal-btn p-1">
                            <i data-lucide="x" class="w-8 h-8 text-gray-500"></i>
                        </button>
                    </div>
                    <p class="font-body text-gray-600 mb-6 text-lg">${data.value}</p>
                    <h3 class="font-bold text-3xl mb-3 text-gray-700">Curriculum Highlights</h3>
                    <ul class="space-y-2 mb-8">
                        ${data.curriculum.map(item => `
                            <li class="flex items-center text-xl">
                                <i data-lucide="check-circle-2" class="w-6 h-6 text-green-500 mr-2"></i>${item}
                            </li>
                        `).join('')}
                    </ul>
                    <div class="bg-${data.color}-100 crayon-border p-6 flex justify-between items-center">
                        <div>
                            <p class="text-gray-600 font-medium text-xl">To know more</p>
                            <p class="text-4xl font-bold text-gray-800">Contact Us</p>
                        </div>
                        <button class="open-contact-modal-from-program crayon-button bg-${data.color}-500 text-white font-bold px-6 py-3 text-xl">Book a Tour</button>
                    </div>
                </div>
            </div>
        </div>`;
    }
    
    contactModalTemplate() {
        return `
        <div class="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 opacity-0" style="display: none;">
            <div class="modal-content bg-paper crayon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-5xl font-bold text-gray-800">Schedule a Visit</h2>
                            <p class="text-xl text-gray-600 mt-2">We'd love to show you around our campus!</p>
                        </div>
                        <button class="close-modal-btn p-1">
                            <i data-lucide="x" class="w-8 h-8 text-gray-500"></i>
                        </button>
                    </div>
                    <form id="contact-form" class="space-y-4">
                        <div class="text-2xl">
                            <label for="parentName" class="font-medium text-gray-700">Parent's Name</label>
                            <input type="text" id="parentName" name="parentName" class="w-full mt-1 p-3 crayon-border text-xl" required>
                        </div>
                        <div class="text-2xl">
                            <label for="phone" class="font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" name="phone" class="w-full mt-1 p-3 crayon-border text-xl" required>
                        </div>
                        <div class="text-2xl">
                            <label for="childAge" class="font-medium text-gray-700">Child's Age</label>
                            <input type="number" id="childAge" name="childAge" min="1" max="8" class="w-full mt-1 p-3 crayon-border text-xl" required>
                        </div>
                        <div class="text-2xl">
                            <label for="program" class="font-medium text-gray-700">Program Interested In</label>
                            <select id="program" name="program" class="w-full mt-1 p-3 crayon-border text-xl" required>
                                <option value="">Select a program</option>
                                <option value="playgroup">Playgroup</option>
                                <option value="nursery">Nursery</option>
                                <option value="lkg">LKG</option>
                                <option value="ukg">UKG</option>
                                <option value="daycare">Day Care</option>
                            </select>
                        </div>
                        <div class="text-2xl">
                            <label for="message" class="font-medium text-gray-700">Additional Message (Optional)</label>
                            <textarea id="message" name="message" class="w-full mt-1 p-3 crayon-border text-xl" rows="3"></textarea>
                        </div>
                        <button type="submit" class="w-full crayon-button bg-red-400 text-white font-bold text-2xl p-4 flex items-center justify-center gap-2">
                            <span id="submit-text">Submit Inquiry</span>
                            <div id="submit-spinner" class="spinner hidden" style="width: 20px; height: 20px;"></div>
                        </button>
                        <p id="contact-form-success-message" class="text-green-600 text-center font-semibold hidden text-xl">Thank you! We'll call you soon!</p>
                        <p id="contact-form-error-message" class="text-red-600 text-center font-semibold hidden text-xl">There was an error submitting your form. Please try again or call us directly.</p>
                    </form>
                </div>
            </div>
        </div>`;
    }
    
    blogModalTemplate(data) {
        return `
        <div class="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 opacity-0" style="display: none;">
            <div class="modal-content bg-paper crayon-border w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-95 blog-modal-content">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-5xl font-bold text-gray-800">${data.title}</h2>
                            <p class="text-xl text-${data.color}-600 font-semibold mt-1">${data.subtitle}</p>
                        </div>
                        <button class="close-modal-btn p-1">
                            <i data-lucide="x" class="w-8 h-8 text-gray-500"></i>
                        </button>
                    </div>
                    <div class="flex flex-col md:flex-row gap-8 mb-8">
                        <div class="md:w-2/5">
                            <img src="${data.image}" alt="${data.title}" class="w-full h-64 object-cover crayon-border">
                        </div>
                        <div class="md:w-3/5">
                            <div class="prose max-w-none font-body text-gray-700">
                                ${data.content}
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-8">
                        <button class="close-blog-modal crayon-button bg-red-400 text-white font-bold px-8 py-4 text-xl">Close</button>
                    </div>
                </div>
            </div>
        </div>`;
    }
    
    setupModalEvents(overlay, type) {
        // Close modal when clicking overlay or close button
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || 
                e.target.closest('.close-modal-btn') || 
                e.target.closest('.close-review-modal') || 
                e.target.closest('.close-blog-modal')) {
                this.closeModal(overlay);
            }
        });
        
        // Open contact modal from program modal
        if (type === 'program') {
            const openContactModalBtns = overlay.querySelectorAll('.open-contact-modal-from-program');
            openContactModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeModal(overlay);
                    setTimeout(() => {
                        this.createContactModal();
                    }, 300);
                });
            });
        }
    }
    
    closeModal(overlay) {
        overlay.classList.add('opacity-0');
        overlay.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Initialize modal manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});
