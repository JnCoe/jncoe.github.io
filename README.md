# Jonas Coelho - Personal Website

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)
[![Code License](https://img.shields.io/badge/Code-GPL--3.0-blue)](LICENSE.txt)
[![Content License](https://img.shields.io/badge/Content-All%20Rights%20Reserved-red)](LICENSE.txt)

A modern, responsive personal portfolio website showcasing data science projects and professional experience.

**Created by Jonas Coelho** based on the [Read Only template](https://html5up.net/read-only) by HTML5 UP ([@ajlkn](https://twitter.com/ajlkn)).

## 🏗️ Architecture

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

### Customizing Colors

Edit CSS custom properties in `css/variables.css`:

```css
:root {
    --color-primary: #5393ce;
    --color-secondary: #605778;
    /* ... more variables */
}
```
## 📄 License

This project uses a dual-license structure:

### Code License - GPLv3

The **source code** of this website is licensed under the [GNU General Public License v3.0](LICENSE.txt). This means you are free to:
- ✅ Use the code for personal or commercial projects
- ✅ Modify and adapt the code to your needs
- ✅ Distribute the code and your modifications
- ⚠️ **Any derivative works must also be open-source under GPLv3**
- ⚠️ **You must preserve attribution to the original authors**

### Content Copyright - All Rights Reserved

The **content** of this website (blog posts, images, personal information, project descriptions, etc.) is **© Jonas Coelho - All Rights Reserved**. You may NOT copy, reproduce, or distribute the content without explicit permission.

### Original Template Attribution

This project was originally based on the [Read Only template](https://html5up.net/read-only) by [HTML5 UP](https://html5up.net) ([@ajlkn](https://twitter.com/ajlkn)), licensed under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). The current codebase has been extensively refactored and modernized by Jonas Coelho.

### Open Source Philosophy

This website is open-source because I believe in sharing knowledge and helping others learn. If you fork this project:
- 🎨 **Please customize the design** to make it your own - don't create an exact clone
- 📝 **Replace all content** with your own information
- ✅ **Keep the license notices** and attribution comments in the code
- 💬 Feel free to reach out if you have questions!

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).

This is a personal website, but if you find bugs or have suggestions, feel free to open an issue.

