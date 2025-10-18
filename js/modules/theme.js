/**
 * Theme Module
 * Handles dark mode toggle and persistence
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.init();
    }

    /**
     * Get stored theme from localStorage
     * @returns {string} Theme name ('light' or 'dark')
     */
    getStoredTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) {
            return stored;
        }
        
        // Check system preference if no stored theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    /**
     * Set theme on document
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        this.updateToggleIcons();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Update toggle button icons
     */
    updateToggleIcons() {
        const icon = this.currentTheme === 'light' ? 'fa-moon' : 'fa-sun';
        const toggleButtons = document.querySelectorAll('.theme-toggle i, .theme-toggle-mobile i');
        
        toggleButtons.forEach(button => {
            button.className = `fas ${icon}`;
        });
    }

    /**
     * Initialize theme system
     */
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);

        // Bind toggle buttons
        const toggleButtons = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only update if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
}

export default ThemeManager;

