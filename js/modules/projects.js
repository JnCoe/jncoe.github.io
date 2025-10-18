/**
 * Projects Module
 * Renders project cards and manages modal
 */

import { projectsData } from '../data/projects-data.js';

class ProjectsManager {
    constructor() {
        this.container = document.getElementById('projectsGrid');
        this.modal = null;
        
        this.init();
    }

    /**
     * Create HTML for a project card
     * @param {Object} project - Project data
     * @returns {string} HTML string
     */
    createProjectCard(project) {
        const tags = project.tags.map(tag => 
            `<span class="project-tag">${tag}</span>`
        ).join('');

        return `
            <div class="project-card" data-project-id="${project.id}">
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tags">${tags}</div>
                </div>
            </div>
        `;
    }

    /**
     * Create and show project modal
     * @param {Object} project - Project data
     */
    showModal(project) {
        // Remove existing modal if any
        this.closeModal();

        // Create technologies HTML
        const technologies = project.technologies.length > 0 ? `
            <div class="project-modal-tech">
                ${project.technologies.map(tech => 
                    `<img src="${tech}" alt="Technology">`
                ).join('')}
            </div>
        ` : '';

        // Create links HTML
        const links = project.links.length > 0 ? `
            <div class="project-modal-links">
                <h3>Links</h3>
                <ul>
                    ${project.links.map(link => `
                        <li>
                            <a href="${link.url}" target="_blank" rel="noopener noreferrer">
                                <i class="${link.icon}"></i>
                                <span>${link.text}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';

        // Create modal HTML
        const modalHTML = `
            <div class="project-modal" id="projectModal">
                <div class="project-modal-content">
                    <button class="project-modal-close" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="project-modal-body">
                        <h2 class="project-modal-title">${project.title}</h2>
                        ${technologies}
                        <div class="project-modal-description">
                            ${project.fullDescription}
                        </div>
                        ${links}
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('projectModal');

        // Show modal
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);

        // Bind close events
        this.bindModalEvents();
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            setTimeout(() => {
                this.modal.remove();
                this.modal = null;
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Bind modal event listeners
     */
    bindModalEvents() {
        if (!this.modal) return;

        // Close button
        const closeBtn = this.modal.querySelector('.project-modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Render project cards
     */
    render() {
        this.container.innerHTML = projectsData.map(project => 
            this.createProjectCard(project)
        ).join('');

        // Bind card click events
        this.container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.projectId;
                const project = projectsData.find(p => p.id === projectId);
                if (project) {
                    this.showModal(project);
                }
            });

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    /**
     * Initialize projects
     */
    init() {
        this.render();
    }
}

export default ProjectsManager;

