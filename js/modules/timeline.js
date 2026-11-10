/**
 * Timeline Module
 * Renders and manages the timeline with filtering
 * 
 * Created by Jonas Coelho
 * Licensed under GPLv3 - see LICENSE.txt for details
 */

import { timelineData } from '../data/timeline-data.js';

class TimelineManager {
    constructor() {
        this.container = document.getElementById('timeline');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        
        this.init();
    }

    /**
     * Create HTML for a timeline item
     * @param {Object} item - Timeline data item
     * @returns {string} HTML string
     */
    createTimelineItem(item) {
        if (item.roles && item.roles.length) {
            return this.createMultiRoleItem(item);
        }

        return `
            <div class="timeline-item" data-type="${item.type}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div>
                            <h3 class="timeline-title">${item.organization}</h3>
                            <p class="timeline-subtitle">
                                <i class="fas ${this.getIcon(item)}"></i>
                                ${item.title}
                            </p>
                        </div>
                        <div class="timeline-date">${item.date}</div>
                    </div>
                    <p class="timeline-description">${item.description}</p>
                    <div class="timeline-tags">${this.createTags(item.tags)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Create HTML for an organization with several roles (newest first).
     * Every role after the first gets a smaller dot on the timeline line.
     * @param {Object} item - Timeline data item with a `roles` array
     * @returns {string} HTML string
     */
    createMultiRoleItem(item) {
        const roles = item.roles.map((role, index) => `
            <div class="timeline-role">
                ${index > 0 ? '<div class="timeline-subdot"></div>' : ''}
                <div class="timeline-role-header">
                    <p class="timeline-subtitle">
                        <i class="fas ${this.getIcon(item)}"></i>
                        ${role.title}
                    </p>
                    <span class="timeline-role-date">${role.date}</span>
                </div>
                <p class="timeline-description">${role.description}</p>
                <div class="timeline-tags">${this.createTags(role.tags)}</div>
            </div>
        `).join('');

        return `
            <div class="timeline-item" data-type="${item.type}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h3 class="timeline-title">${item.organization}</h3>
                        <div class="timeline-date">${item.date}</div>
                    </div>
                    ${roles}
                </div>
            </div>
        `;
    }

    getIcon(item) {
        return item.type === 'education' ? 'fa-graduation-cap' : 'fa-briefcase';
    }

    createTags(tags = []) {
        return tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('');
    }

    /**
     * Render timeline items
     * @param {string} filter - Filter type ('all', 'education', 'work')
     */
    render(filter = 'all') {
        const filteredData = filter === 'all' ? 
            timelineData : 
            timelineData.filter(item => item.type === filter);

        this.container.innerHTML = filteredData.map(item => 
            this.createTimelineItem(item)
        ).join('');

        // Trigger animation
        setTimeout(() => {
            this.container.querySelectorAll('.timeline-item').forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }, 10);
    }

    /**
     * Filter timeline items
     * @param {string} filter - Filter type
     */
    filterTimeline(filter) {
        this.currentFilter = filter;
        
        // Update button states
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Re-render with filter
        this.render(filter);
    }

    /**
     * Initialize timeline
     */
    init() {
        // Initial render
        this.render();

        // Bind filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterTimeline(button.dataset.filter);
            });
        });
    }
}

export default TimelineManager;

