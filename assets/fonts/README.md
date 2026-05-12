Place local STIX Two Text font files in this directory for fully offline rendering.

Expected filenames:
- STIXTwoText-VariableFont_wght.ttf
- STIXTwoText-Italic-VariableFont_wght.ttf

Why this matters:
- The deck is configured to use local("STIX Two Text") first.
- If the defense machine does not have STIX Two Text installed system-wide,
  these local files ensure identical typography.

Validation:
- Render once and inspect a slide title and body text for font consistency.
- Optionally run: fc-list | rg "STIX Two Text"
