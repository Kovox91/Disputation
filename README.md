# Interactive Quarto Reveal.js Testbed

This folder contains a Quarto + Reveal.js presentation prepared for interactive animation of dissertation SVG figures.

## Included

- `index.qmd`: deck source with one slide per figure.
- `_quarto.yml`: reveal.js configuration.
- `assets/styles/theme.scss`: muted scientific visual style using STIX Two Text.
- `assets/js/svg-loader.js`: inlines SVGs into slides for DOM-level animation.
- `assets/js/svg-animator.js`: fragment hooks for class-based animation control.
- `assets/fonts/README.md`: instructions for reliable offline font setup.

## Font reliability for defense machine

To avoid network dependency and ensure typography matches your figures:

1. Put STIX Two Text files in `assets/fonts/`:
   - `STIXTwoText-VariableFont_wght.ttf`
   - `STIXTwoText-Italic-VariableFont_wght.ttf`
2. Keep those files together with the deck when exporting.
3. Optionally verify system install with:
   - `fc-list | rg "STIX Two Text"`

The stylesheet prefers local font files and falls back to locally installed STIX Two Text.

## Run locally

Install Quarto first, then from this folder:

```bash
quarto preview
```

Render static output:

```bash
quarto render
```

## Animation workflow

- SVGs are loaded inline using `.svg-stage[data-svg-src="..."]`.
- Create a reveal fragment and attach selectors:

```markdown
::: {.fragment data-anim-target="#your_id, .your_class" data-anim-class="is-highlighted"}
Animation step label
:::
```

- On fragment show/hide, the configured class is toggled on matching SVG elements.
- Existing utility classes in theme:
  - `is-highlighted`
  - `is-muted`

Next, we can map each figure's actual element IDs/classes and define exact animation sequences.
