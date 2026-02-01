/**
 * Navigation Module
 * Handles smooth scrolling, active states, and mobile menu
 * 
 * Created by Jonas Coelho
 * Licensed under GPLv3 - see LICENSE.txt for details
 */

class NavigationManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        
        this.init();
    }

    /**
     * Smooth scroll to section
     * @param {string} targetId - ID of target section
     */
    scrollToSection(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;

        const offset = window.innerWidth <= 1024 ? 
            document.getElementById('mobileHeader').offsetHeight : 0;

        const targetPosition = target.offsetTop - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Close mobile menu if open
        if (window.innerWidth <= 1024) {
            this.closeMobileMenu();
        }
    }

    /**
     * Update active navigation link based on scroll position
     */
    updateActiveLink() {
        const scrollPos = window.scrollY;
        const offset = window.innerWidth <= 1024 ? 
            document.getElementById('mobileHeader').offsetHeight + 100 : 100;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - offset;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.sidebar.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.sidebar.classList.remove('active');
        this.menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Initialize navigation
     */
    init() {
        // Bind navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only prevent default for internal links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href);
                }
            });
        });

        // Bind mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                this.sidebar.classList.contains('active') &&
                !this.sidebar.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Update active link on scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveLink();
            }, 100);
        });

        // Initial active link update
        this.updateActiveLink();

        // Close mobile menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.closeMobileMenu();
            }
        });
    }
}

export default NavigationManager;

