# GitHub Pages Deployment Guide

## Overview
This Quarto presentation is configured for easy hosting on GitHub Pages with embedded resources for offline access.

## Prerequisites
- Git installed on your machine
- A GitHub repository (create one at https://github.com/new if you haven't already)

## Setup Steps

### 1. Initialize Git (if not already done)
```bash
cd /home/sascha/data/Documents/dissertation/presentation
git init
git add .
git commit -m "Initial commit: presentation setup for GitHub Pages"
```

### 2. Add Remote Repository
Replace `USERNAME` and `REPO_NAME` with your actual GitHub username and repository name:
```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

Go to your repository on GitHub:
1. Navigate to **Settings** → **Pages**
2. Under "Build and deployment", select:
   - **Source**: Deploy from a branch
   - **Branch**: main (or your preferred branch)
   - **Folder**: / (root)
3. Click **Save**

GitHub Pages will build and your presentation will be available at:
```
https://USERNAME.github.io/REPO_NAME/
```

## Updating Your Presentation

After making changes:

```bash
# Render the presentation
quarto render

# Commit and push changes
git add .
git commit -m "Update: your changes description"
git push
```

The site updates automatically within a few minutes.

## Technical Details

- **Embedded Resources**: The Quarto config uses `embed-resources: true`, meaning all CSS, fonts, and scripts are embedded in `index.html`
- **No Jekyll Processing**: The `.nojekyll` file prevents GitHub Pages from processing the site with Jekyll, avoiding conflicts
- **Font Handling**: STIX Two Text fonts are embedded in the CSS, ensuring consistent typography

## Troubleshooting

### Fonts Not Loading
- Fonts are embedded in the compiled CSS. If they don't appear, check that your browser hasn't cached an older version (Ctrl+Shift+R to hard refresh)

### Styles Not Applying
- The theme and styles are embedded in `index.html`. Hard refresh your browser if changes don't appear immediately

### GitHub Pages Not Updating
- Check the "Actions" tab in your GitHub repository to see if the deployment succeeded
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## Local Preview

To preview changes locally before pushing:

```bash
quarto preview
```

This opens a live preview at `http://localhost:5173` (or similar port shown in terminal).
