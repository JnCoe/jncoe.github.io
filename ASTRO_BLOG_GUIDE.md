# Astro Blog Setup Guide

Your Astro blog is now set up and ready to use! Here's what was created:

## Project Structure

```
jncoe.github.io/
├── src/
│   ├── content/
│   │   ├── blog/              # Your blog posts (markdown files)
│   │   │   └── welcome.md     # Example post
│   │   └── config.ts          # Collection schema
│   ├── pages/
│   │   └── blog/
│   │       ├── index.astro    # Blog index page (/blog/)
│   │       └── [slug].astro   # Individual post pages (/blog/{slug}/)
├── astro.config.mjs           # Astro configuration
├── package.json               # Dependencies and scripts
└── dist/                       # Build output (generated)
```

## Workflow

### 1. Write a New Blog Post

Create a new `.md` file in `src/content/blog/`:

```bash
# Example: src/content/blog/my-first-post.md
---
title: "My First Post"
description: "A brief description of your post"
pubDate: 2025-01-15
author: "Jonas Coelho"
tags: ["data-science", "python"]
draft: false
---

# My First Post

Your markdown content here...
```

**Important:** The filename becomes the URL slug. So `my-first-post.md` → `https://jncoe.github.io/blog/my-first-post/`

**Key fields:**
- `title`: Post title (required)
- `description`: Short description shown in the blog index (required)
- `pubDate`: Publication date (required, format: YYYY-MM-DD)
- `author`: Post author (optional, defaults to "Jonas Coelho")
- `tags`: Array of tags (optional)
- `draft`: Set to `true` to hide a post (optional, defaults to `false`)
- `updatedDate`: When last updated (optional)

### 2. Build Locally

```bash
npm run build
```

This generates the blog HTML in the `dist/` folder. You can preview with:

```bash
npm run preview
```

This starts a local server. Visit `http://localhost:3000/blog/` to see your blog.

### 3. Publish to GitHub Pages (Option A: Root Publishing)

When you're ready to publish, move the built files to the root of your repo:

```bash
# From your repo root:
rm -rf *.html  # Remove old site files (optional, be careful!)
cp -r dist/* .
git add .
git commit -m "Publish blog updates"
git push origin master
```

GitHub Pages will automatically deploy from the root of your `master` branch.

### Development Workflow

For local development, use the dev server:

```bash
npm run dev
```

This starts a live-reload server at `http://localhost:3000`. Any changes to `src/content/blog/*.md` or template files will refresh automatically.

## Customization

### Styling

The blog pages have built-in dark/light mode support via CSS variables. To customize:

- Edit `src/pages/blog/index.astro` to style the blog index
- Edit `src/pages/blog/[slug].astro` to style individual posts

Look for the `<style>` blocks and modify colors, fonts, spacing, etc.

### Site Configuration

Your Astro config in `astro.config.mjs`:
- `site`: Your domain (currently `https://jncoe.github.io`)
- `outDir`: Output folder (currently `dist`)
- `build.format`: Set to `'directory'` for clean URLs (e.g., `/blog/post/` instead of `/blog/post.html`)
- `trailingSlash`: Set to `'always'` for consistent trailing slashes

### Content Schema

The blog post schema is defined in `src/content/config.ts`. You can add or modify fields here (e.g., add `image`, `featured`, etc.).

## Adding More Posts

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter (the YAML metadata at the top)
3. Write your post in Markdown
4. Run `npm run build`
5. Commit and push to GitHub

Posts are displayed in reverse chronological order (newest first) on the blog index.

## URL Stability

**Important:** URLs are based on the filename. So:
- `src/content/blog/welcome.md` → `/blog/welcome/`
- `src/content/blog/my-post.md` → `/blog/my-post/`

To ensure URLs don't change:
- **Don't rename post files** (unless you want to change the URL)
- **Don't rely on dates in filenames** for URL structure (keep date in frontmatter only)

If you do rename a post, the old URL will 404. Set up a redirect in GitHub Pages if needed.

## Troubleshooting

**Build fails:**
- Run `npm install` to ensure all dependencies are installed
- Check that all post files have valid frontmatter (YAML at the top)

**Styles look broken:**
- Clear your browser cache
- Make sure you've committed the `dist/` folder or the latest build output

**Posts aren't showing:**
- Check that `draft: false` is set (or omitted)
- Run `npm run build` again
- Verify the file is in `src/content/blog/`

## Next Steps

1. Replace the example `welcome.md` with your first real post (or keep it as inspiration)
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Publish: Copy `dist/` contents to repo root and push

Happy blogging! 🚀
