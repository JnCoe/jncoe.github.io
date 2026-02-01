/**
 * Main Application Entry Point
 * Initializes all modules and manages the application
 * 
 * Created by Jonas Coelho based on Read Only template by HTML5 UP (html5up.net)
 * Licensed under GPLv3 - see LICENSE.txt for details
 */

import ThemeManager from './modules/theme.js';
import NavigationManager from './modules/navigation.js';
import TimelineManager from './modules/timeline.js';
import ProjectsManager from './modules/projects.js';

/**
 * Application Class
 * Central controller for the website
 */
class App {
    constructor() {
        this.theme = null;
        this.navigation = null;
        this.timeline = null;
        this.projects = null;
    }

    /**
     * Initialize all modules
     */
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    /**
     * Initialize all application modules
     */
    initializeModules() {
        try {
            // Initialize theme system first (affects visual appearance)
            this.theme = new ThemeManager();
            
            // Initialize navigation
            this.navigation = new NavigationManager();
            
            // Initialize timeline
            this.timeline = new TimelineManager();
            
            // Initialize projects
            this.projects = new ProjectsManager();
            
            // Log success
            console.log('✨ Application initialized successfully');
            
            // Remove preload class from body
            setTimeout(() => {
                document.body.classList.remove('is-preload');
            }, 100);
            
        } catch (error) {
            console.error('❌ Error initializing application:', error);
        }
    }

    /**
     * Add smooth reveal animations for sections
     */
    addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Create and initialize application
const app = new App();
app.init();

// Export for potential external use
export default app;

