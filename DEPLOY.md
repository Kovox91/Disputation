# GitHub Pages Deployment

Your presentation is configured for automatic deployment to GitHub Pages using Quarto's built-in publishing tools.

## Current Configuration

- **Repository**: https://github.com/Kovox91/Disputation
- **Publishing target**: GitHub Pages (`gh-pages` branch)
- **Live URL**: https://Kovox91.github.io/Disputation/

## Prerequisites

- Git installed
- Quarto installed (https://quarto.org/docs/get-started/)
- Repository already connected to GitHub

## Deployment Steps

### One-Command Deployment (Recommended)

Deploy directly from your local machine:

```bash
cd /home/sascha/data/Documents/dissertation/presentation
quarto publish gh-pages
```

This will:
1. Render the presentation (`index.html` and supporting files)
2. Create/update a `gh-pages` branch
3. Push to GitHub
4. Activate GitHub Pages automatically

Your presentation will be live within 1-2 minutes at:
```
https://Kovox91.github.io/Disputation/
```

### Manual Alternative

If you prefer manual control:

```bash
# Render the presentation
quarto render

# Stage, commit, and push all files
git add .
git commit -m "Update presentation"
git push origin main
```

Then enable GitHub Pages in repository settings (Settings → Pages → Source: main).

## Updating Your Presentation

After making changes to your slides or figures:

```bash
# Test locally first
quarto preview

# Once satisfied, deploy
quarto publish gh-pages
```

## Technical Details

### Resource Handling

- **SVG Figures**: Loaded dynamically by JavaScript (`assets/js/svg-loader.js`)
- **Fonts**: Self-hosted in `assets/fonts/`
- **Styles**: STIX Two Text scientific theme (`assets/styles/theme.scss`)
- **Embedding**: Set to `embed-resources: false` to allow dynamic SVG loading and better performance

### Directory Structure

```
.
├── _quarto.yml            # Quarto configuration
├── _publish.yml           # Publishing targets
├── index.qmd              # Presentation source
├── index.html             # Rendered output (generated)
├── index_files/           # Supporting assets (generated)
├── assets/
│   ├── fonts/             # STIX Two Text fonts
│   ├── js/                # SVG animation scripts
│   └── styles/            # Custom theme (SCSS)
├── figures/               # SVG and image files
└── .nojekyll              # Tell GitHub Pages to skip Jekyll
```

### .nojekyll File

The `.nojekyll` file prevents GitHub Pages from processing with Jekyll, which would interfere with the presentation.

## Troubleshooting

### "quarto publish gh-pages" fails

**Authentication error?**
- Ensure git is configured: `git config user.email` and `git config user.name`
- Verify repository access: `git remote -v`
- Try: `git push origin main` to test connectivity

**Other error?**
- Verify Quarto is installed: `quarto --version`
- Check that files are tracked: `git status`
- Ensure no uncommitted changes: `git add . && git commit -m "Save changes"`

### Presentation doesn't load after deployment

- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R) to clear cache
- Check GitHub Actions tab to verify deployment succeeded
- Verify files are in git: `git log --oneline` (should show recent commits)

### Fonts not displaying correctly

- Fonts are served from `assets/fonts/`
- Check browser console (F12) for 404 errors
- Verify `theme.scss` has correct paths

### Styles or animations not working

- Hard refresh browser cache (Ctrl+Shift+R)
- Verify `svg-loader.js` and `svg-animator.js` loaded (check Network tab in browser console)
- Ensure figure files exist in `figures/` directory
