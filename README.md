# Jonas Coelho - Personal Website

A modern, responsive personal portfolio website showcasing data science projects and professional experience.

## 🎨 Features

- **Modern Design**: Clean, professional aesthetic with custom gradient backgrounds
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Responsive**: Fully responsive design that works on all devices
- **Accessible**: Built with semantic HTML and ARIA labels for accessibility
- **Interactive Timeline**: Unified timeline showing both education and professional experience with filtering
- **Project Showcase**: Interactive project cards with detailed modal views
- **Smooth Animations**: Subtle animations and transitions for better UX
- **No jQuery**: Built with modern vanilla JavaScript (ES6+)

## 🏗️ Architecture

### HTML
- Semantic HTML5 structure
- Accessibility-focused markup
- Meta tags for SEO and social sharing

### CSS
Modular CSS architecture using CSS Custom Properties:
- `variables.css` - Theme configuration and design tokens
- `base.css` - Reset, typography, and foundational styles
- `components.css` - Reusable UI components
- `layout.css` - Page structure and positioning

### JavaScript
ES6+ modules with no external dependencies:
- `main.js` - Application entry point
- `modules/theme.js` - Dark mode management
- `modules/navigation.js` - Smooth scrolling and menu
- `modules/timeline.js` - Timeline rendering and filtering
- `modules/projects.js` - Project cards and modal
- `data/` - Structured data files for content

## 🚀 Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/JnCoe/jncoe.github.io.git
cd jncoe.github.io
```

2. Serve the files with a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open your browser to `http://localhost:8000`

### Deployment

The site is deployed via GitHub Pages. Any push to the main branch will automatically deploy.

## 📁 Project Structure

```
jncoe.github.io/
├── index.html              # Main HTML file
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── base.css           # Base styles
│   ├── components.css     # Component styles
│   └── layout.css         # Layout styles
├── js/
│   ├── main.js            # Application entry point
│   ├── modules/           # JavaScript modules
│   │   ├── theme.js
│   │   ├── navigation.js
│   │   ├── timeline.js
│   │   └── projects.js
│   └── data/              # Content data
│       ├── timeline-data.js
│       └── projects-data.js
├── images/                # Image assets
├── assets/                # Legacy assets (to be removed)
└── README.md             # This file
```

## 🎯 Key Technologies

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)**: Modules, classes, arrow functions, template literals
- **Font Awesome**: Icons
- **Google Fonts**: Inter and JetBrains Mono

## 🔧 Customization

### Adding a Timeline Item

Edit `js/data/timeline-data.js`:

```javascript
{
    type: 'work', // or 'education'
    organization: 'Company Name',
    title: 'Job Title',
    date: '2023 - Present',
    description: 'Job description...',
    tags: ['Skill1', 'Skill2']
}
```

### Adding a Project

Edit `js/data/projects-data.js`:

```javascript
{
    id: 'unique-id',
    title: 'Project Title',
    description: 'Short description',
    image: 'images/project.jpg',
    tags: ['Tag1', 'Tag2'],
    technologies: ['images/tech1.svg'],
    fullDescription: '<p>Full HTML description</p>',
    links: [
        { url: '...', text: 'Link Text', icon: 'fas fa-link' }
    ]
}
```

### Customizing Colors

Edit CSS custom properties in `css/variables.css`:

```css
:root {
    --color-primary: #5393ce;
    --color-secondary: #605778;
    /* ... more variables */
}
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is based on a template by HTML5 UP and has been significantly refactored and modernized. Original template is licensed under CCA 3.0. Custom code and modifications are available for personal and commercial use.

## 🤝 Contributing

This is a personal website, but if you find bugs or have suggestions, feel free to open an issue.

## 👤 Author

**Jonas Coelho**
- LinkedIn: [@jonasbarros](https://www.linkedin.com/in/jonasbarros/)
- GitHub: [@JnCoe](https://github.com/JnCoe)

---

Built with 💙 using modern web technologies.

