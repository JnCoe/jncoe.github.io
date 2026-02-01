/**
 * Projects Module
 * Renders project cards and manages modal
 */

import { projectsData } from '../data/projects-data.js';

class ProjectsManager {
    constructor() {
        this.container = document.getElementById('projectsGrid');
        this.modal = null;

        this.badgeHeight = 28;
        this.badgeLeftWidth = 28;
        this.badgeTextPadding = 10;
        this.badgeFontSize = 11;
        this.badgeFontWeight = 700;
        this.badgeFontFamily = 'Verdana, Geneva, "DejaVu Sans", sans-serif';
        
        this.init();
    }

    getBadgeCanvasContext() {
        if (!ProjectsManager.badgeMeasureCanvas) {
            ProjectsManager.badgeMeasureCanvas = document.createElement('canvas');
        }

        return ProjectsManager.badgeMeasureCanvas.getContext('2d');
    }

    measureBadgeTextWidth(text) {
        const context = this.getBadgeCanvasContext();
        if (!context) return text.length * (this.badgeFontSize * 0.6);

        context.font = `${this.badgeFontWeight} ${this.badgeFontSize}px ${this.badgeFontFamily}`;
        return context.measureText(text).width;
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    buildBadgeSvg({ label, colorA, colorB, logoSrc }) {
        const safeLabel = this.escapeHtml(label.toUpperCase());
        const textWidth = this.measureBadgeTextWidth(label.toUpperCase());
        const rightWidth = Math.ceil(textWidth + (this.badgeTextPadding * 2));
        const totalWidth = this.badgeLeftWidth + rightWidth;
        const logoSize = 16;
        const logoX = Math.round((this.badgeLeftWidth - logoSize) / 2);
        const logoY = Math.round((this.badgeHeight - logoSize) / 2);
        const textX = this.badgeLeftWidth + this.badgeTextPadding;
        const textY = this.badgeHeight / 2;

        const logoMarkup = logoSrc ? `
            <image href="${this.escapeHtml(logoSrc)}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />
        ` : '';

        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${this.badgeHeight}" viewBox="0 0 ${totalWidth} ${this.badgeHeight}" role="img" aria-label="${safeLabel}">
                <rect width="${this.badgeLeftWidth}" height="${this.badgeHeight}" fill="${this.escapeHtml(colorA)}"></rect>
                <rect x="${this.badgeLeftWidth}" width="${rightWidth}" height="${this.badgeHeight}" fill="${this.escapeHtml(colorB)}"></rect>
                ${logoMarkup}
                <text x="${textX}" y="${textY}" fill="#ffffff" font-family="${this.badgeFontFamily}" font-size="${this.badgeFontSize}" font-weight="${this.badgeFontWeight}" dominant-baseline="middle">${safeLabel}</text>
            </svg>
        `;
    }

    renderTechnologyBadge(tech) {
        if (typeof tech === 'string') {
            return `<img src="${this.escapeHtml(tech)}" alt="Technology">`;
        }

        if (!tech || !tech.label) {
            return '';
        }

        const colorA = tech.colorA || '#4f4f4f';
        const colorB = tech.colorB || '#6a6a6a';
        const logoSrc = tech.logoSrc;
        const logoIcon = tech.logoIcon;
        const iconColor = tech.iconColor || '#3776ab';
        const svg = this.buildBadgeSvg({
            label: tech.label,
            colorA,
            colorB,
            logoSrc
        });
        const iconMarkup = logoIcon
            ? `<i class="project-modal-badge-icon ${this.escapeHtml(logoIcon)}" style="color: ${this.escapeHtml(iconColor)};" aria-hidden="true"></i>`
            : '';

        return `
            <span class="project-modal-badge" role="img" aria-label="${this.escapeHtml(tech.label)}">
                ${svg}
                ${iconMarkup}
            </span>
        `;
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
                ${project.technologies.map(tech => this.renderTechnologyBadge(tech)).join('')}
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

