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
        const subtitle = item.subtitle ? 
            `<div class="timeline-info" title="${item.subtitle}">
                <i class="fas fa-info-circle"></i>
            </div>` : '';

        const tags = item.tags.map(tag => 
            `<span class="timeline-tag">${tag}</span>`
        ).join('');

        return `
            <div class="timeline-item" data-type="${item.type}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div>
                            <h3 class="timeline-title">${item.organization}</h3>
                            <p class="timeline-subtitle">
                                <i class="fas ${item.type === 'education' ? 'fa-graduation-cap' : 'fa-briefcase'}"></i>
                                ${item.title}
                            </p>
                        </div>
                        <div class="timeline-date">${item.date}</div>
                    </div>
                    <p class="timeline-description">${item.description}</p>
                    <div class="timeline-tags">${tags}</div>
                </div>
            </div>
        `;
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

