(() => {
  const DEFAULT_FIG6_NEUTRAL = "#cccccc";
  const DEFAULT_FIG2201_NEUTRAL = "#cccccc";
  const DEFAULT_FIG23_NEUTRAL = "#cccccc";
  const DEFAULT_MUTED_OPACITY = "0.28";
  const FIG23_GREEN_COLORS = new Set(["#009900", "#006600", "#336633"]);
  const FIG23_ORANGE_COLORS = new Set(["#cc6633", "#ff9933", "#ff6600"]);
  const FIG23_BLUE_COLORS = new Set(["#0099ff", "#0066cc", "#3399cc"]);
  let cachedMutedOpacity = null;

  function getMutedOpacity() {
    if (cachedMutedOpacity !== null) {
      return cachedMutedOpacity;
    }

    if (typeof window === "undefined" || typeof document === "undefined" || !document.documentElement) {
      cachedMutedOpacity = DEFAULT_MUTED_OPACITY;
      return cachedMutedOpacity;
    }

    const configured = window.getComputedStyle(document.documentElement).getPropertyValue("--fig-muted-opacity").trim();
    cachedMutedOpacity = configured || DEFAULT_MUTED_OPACITY;
    return cachedMutedOpacity;
  }

  function getLatestVisibleMode(slide, selector, datasetKey) {
    if (!slide || !selector || !datasetKey) {
      return 0;
    }

    const visibleModes = Array.from(slide.querySelectorAll(selector))
      .map((fragment) => {
        const mode = Number.parseInt(fragment.dataset[datasetKey] || "", 10);
        const index = Number.parseInt(fragment.dataset.fragmentIndex || "", 10);
        return { mode, index: Number.isInteger(index) ? index : 0 };
      })
      .filter((item) => Number.isInteger(item.mode) && item.mode >= 0)
      .sort((a, b) => a.index - b.index);

    return visibleModes.length ? visibleModes[visibleModes.length - 1].mode : 0;
  }

  function getTargets(currentSlide, selectorList) {
    if (!selectorList) {
      return [];
    }

    return selectorList
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .flatMap((selector) => Array.from(currentSlide.querySelectorAll(selector)));
  }

  function toggleClassOnTargets(currentSlide, selectorList, cssClass, add) {
    if (!currentSlide || !selectorList || !cssClass) {
      return;
    }

    const targets = getTargets(currentSlide, selectorList);
    targets.forEach((target) => {
      target.classList.toggle(cssClass, add);
    });
  }

  function findFigure6Stage(slide) {
    if (!slide) {
      return null;
    }

    return slide.querySelector('.svg-stage[data-celltype-groups="true"], .svg-stage[data-svg-id="fig06_F_celltype"], .svg-stage[data-svg-id="fig18_F_celltype"]');
  }

  function setFigure6GroupState(slide, groupIndex, add) {
    const stage = findFigure6Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig6NeutralColor || DEFAULT_FIG6_NEUTRAL;
    const groupNodes = stage.querySelectorAll(`[data-fig6-group="${groupIndex}"]`);

    groupNodes.forEach((node) => {
      if (add) {
        const originalFill = node.getAttribute("data-fig6-original-fill") || neutralColor;
        const originalStroke = node.getAttribute("data-fig6-original-stroke") || originalFill;
        node.style.fill = originalFill;
        node.style.stroke = originalStroke;
      } else {
        node.style.fill = neutralColor;
        node.style.stroke = neutralColor;
      }
    });
  }

  function resetFigure6Groups(slide) {
    const stage = findFigure6Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig6NeutralColor || DEFAULT_FIG6_NEUTRAL;
    const allNodes = stage.querySelectorAll("[data-fig6-group]");

    allNodes.forEach((node) => {
      node.style.fill = neutralColor;
      node.style.stroke = neutralColor;
    });
  }

  function syncFigure6Fragments(slide) {
    const stage = findFigure6Stage(slide);
    if (!stage) {
      return;
    }

    resetFigure6Groups(slide);
    const visibleSteps = Array.from(slide.querySelectorAll(".fragment.visible[data-fig6-step]"));
    visibleSteps.forEach((fragment) => {
      const step = Number.parseInt(fragment.dataset.fig6Step || "", 10);
      if (Number.isInteger(step) && step > 0) {
        setFigure6GroupState(slide, step, true);
      }
    });
  }

  function applyFigure6Fragment(fragment, add) {
    if (!window.Reveal || !Reveal.getCurrentSlide) {
      return;
    }

    const currentSlide = Reveal.getCurrentSlide();
    if (!currentSlide) {
      return;
    }

    const step = Number.parseInt(fragment.dataset.fig6Step || "", 10);
    if (!Number.isInteger(step) || step <= 0) {
      return;
    }

    setFigure6GroupState(currentSlide, step, add);
  }

  function findFigure2201Stage(slide) {
    if (!slide) {
      return null;
    }

    return slide.querySelector('.svg-stage[data-svg-id="fig22_domains_01"]');
  }

  function setFigure2201GroupState(slide, groupIndex, add) {
    const stage = findFigure2201Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig2201NeutralColor || DEFAULT_FIG2201_NEUTRAL;
    const groupNodes = stage.querySelectorAll(`[data-fig2201-group="${groupIndex}"]`);

    groupNodes.forEach((node) => {
      const originalFill = node.getAttribute("data-fig2201-original-fill") || "";
      const originalStroke = node.getAttribute("data-fig2201-original-stroke") || "";

      if (add) {
        if (originalFill) {
          node.style.fill = originalFill;
        }
        if (originalStroke) {
          node.style.stroke = originalStroke;
        }
      } else {
        if (originalFill) {
          node.style.fill = neutralColor;
        }
        if (originalStroke) {
          node.style.stroke = neutralColor;
        }
      }
    });
  }

  function resetFigure2201Groups(slide) {
    const stage = findFigure2201Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig2201NeutralColor || DEFAULT_FIG2201_NEUTRAL;
    const allNodes = stage.querySelectorAll("[data-fig2201-group]");
    allNodes.forEach((node) => {
      const originalFill = node.getAttribute("data-fig2201-original-fill") || "";
      const originalStroke = node.getAttribute("data-fig2201-original-stroke") || "";
      if (originalFill) {
        node.style.fill = neutralColor;
      }
      if (originalStroke) {
        node.style.stroke = neutralColor;
      }
    });
  }

  function syncFigure2201Fragments(slide) {
    const stage = findFigure2201Stage(slide);
    if (!stage) {
      return;
    }

    resetFigure2201Groups(slide);
    const visibleSteps = Array.from(slide.querySelectorAll(".fragment.visible[data-fig2201-step]"));
    visibleSteps.forEach((fragment) => {
      const step = Number.parseInt(fragment.dataset.fig2201Step || "", 10);
      if (Number.isInteger(step) && step > 0) {
        setFigure2201GroupState(slide, step, true);
      }
    });
  }

  function applyFigure2201Fragment(fragment, add) {
    if (!window.Reveal || !Reveal.getCurrentSlide) {
      return;
    }

    const currentSlide = Reveal.getCurrentSlide();
    if (!currentSlide) {
      return;
    }

    const step = Number.parseInt(fragment.dataset.fig2201Step || "", 10);
    if (!Number.isInteger(step) || step <= 0) {
      return;
    }

    setFigure2201GroupState(currentSlide, step, add);
  }

  function findFigure23Stage(slide) {
    if (!slide) {
      return null;
    }

    return slide.querySelector('.svg-stage[data-svg-id="fig23_program_heatmap"]');
  }

  function getFigure23Nodes(stage, groupId) {
    const allNodes = Array.from(stage.querySelectorAll("[data-fig23-groups]"));
    if (!groupId) {
      return allNodes;
    }

    return allNodes.filter((node) => {
      const groups = (node.getAttribute("data-fig23-groups") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      return groups.includes(groupId);
    });
  }

  function restoreFigure23Node(node) {
    const originalFill = node.getAttribute("data-fig23-original-fill") || "";
    const originalStroke = node.getAttribute("data-fig23-original-stroke") || "";
    const originalOpacity = node.getAttribute("data-fig23-original-opacity") || "";
    const isTextLike = node.getAttribute("data-fig23-text-like") === "true";

    if (originalFill) {
      node.style.fill = originalFill;
    } else if (isTextLike) {
      node.style.removeProperty("fill");
    }
    if (originalStroke) {
      node.style.stroke = originalStroke;
    } else {
      node.style.removeProperty("stroke");
    }
    if (originalOpacity) {
      node.style.opacity = originalOpacity;
    } else {
      node.style.removeProperty("opacity");
    }
  }

  function muteFigure23Node(node, neutralColor) {
    const originalFill = node.getAttribute("data-fig23-original-fill") || "";
    const originalStroke = node.getAttribute("data-fig23-original-stroke") || "";
    const isTextLike = node.getAttribute("data-fig23-text-like") === "true";

    if (originalFill || isTextLike) {
      node.style.fill = neutralColor;
    }
    if (originalStroke) {
      node.style.stroke = neutralColor;
    }
    node.style.opacity = getMutedOpacity();
  }

  function setFigure23GroupState(slide, groupId, add) {
    const stage = findFigure23Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig23NeutralColor || DEFAULT_FIG23_NEUTRAL;
    const nodes = getFigure23Nodes(stage, groupId);
    nodes.forEach((node) => {
      if (add) {
        restoreFigure23Node(node);
      } else {
        muteFigure23Node(node, neutralColor);
      }
    });
  }

  function setFigure23ColorState(slide, colors, add) {
    const stage = findFigure23Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig23NeutralColor || DEFAULT_FIG23_NEUTRAL;
    const nodes = getFigure23Nodes(stage, null);
    nodes.forEach((node) => {
      const originalFill = (node.getAttribute("data-fig23-original-fill") || "").toLowerCase();
      const originalStroke = (node.getAttribute("data-fig23-original-stroke") || "").toLowerCase();
      const matchesFill = originalFill && colors.has(originalFill);
      const matchesStroke = originalStroke && colors.has(originalStroke);

      if (!matchesFill && !matchesStroke) {
        return;
      }

      if (add) {
        if (matchesFill) {
          node.style.fill = originalFill;
        }
        if (matchesStroke) {
          node.style.stroke = originalStroke;
        }
        const originalOpacity = node.getAttribute("data-fig23-original-opacity") || "";
        if (originalOpacity) {
          node.style.opacity = originalOpacity;
        } else {
          node.style.removeProperty("opacity");
        }
      } else {
        if (matchesFill) {
          node.style.fill = neutralColor;
        }
        if (matchesStroke) {
          node.style.stroke = neutralColor;
        }
        node.style.opacity = getMutedOpacity();
      }
    });
  }

  function resetFigure23(slide) {
    const stage = findFigure23Stage(slide);
    if (!stage) {
      return;
    }

    const neutralColor = stage.dataset.fig23NeutralColor || DEFAULT_FIG23_NEUTRAL;
    getFigure23Nodes(stage, null).forEach((node) => {
      muteFigure23Node(node, neutralColor);
    });
  }

  function syncFigure23Fragments(slide) {
    const stage = findFigure23Stage(slide);
    if (!stage) {
      return;
    }

    const mode = getLatestVisibleMode(slide, ".fragment.visible[data-fig23-mode]", "fig23Mode");
    stage.querySelector("svg.embedded-svg.fig23-ready")?.setAttribute("data-fig23-mode", String(mode));

    resetFigure23(slide);

    if (mode === 0) {
      return;
    }

    if (mode >= 1) {
      setFigure23GroupState(slide, "stage1", true);
    }
    if (mode >= 2) {
      setFigure23GroupState(slide, "stage2", true);
    }
    if (mode >= 3) {
      setFigure23GroupState(slide, "stage3", true);
    }
    if (mode >= 4) {
      setFigure23GroupState(slide, "stage4", true);
    }

    if (mode >= 5 && mode <= 7) {
      setFigure23GroupState(slide, "domains", false);
      if (mode === 5) {
        setFigure23ColorState(slide, FIG23_GREEN_COLORS, true);
      } else if (mode === 6) {
        setFigure23ColorState(slide, FIG23_ORANGE_COLORS, true);
      } else if (mode === 7) {
        setFigure23ColorState(slide, FIG23_BLUE_COLORS, true);
      }
    }

    if (mode >= 8) {
      setFigure23GroupState(slide, "domains", true);
    }

    if (mode >= 9) {
      setFigure23GroupState(slide, "grey1", false);
      setFigure23GroupState(slide, "grey2", false);
      setFigure23GroupState(slide, "grey3", false);
      setFigure23GroupState(slide, "grey4", false);
    }

    if (mode >= 10) {
      getFigure23Nodes(stage, null).forEach((node) => {
        restoreFigure23Node(node);
      });
    }
  }

  function syncFigure2202Fragments(slide) {
    if (!slide) {
      return;
    }

    const svg = slide.querySelector("svg.embedded-svg.fig2202-ready");
    if (!svg) {
      return;
    }

    const stableId = svg.dataset.fig2202StableId || "stable";
    const targetIds = [stableId, "S14-S16", "S10", "s17/7", "hidden"];
    const targets = targetIds
      .map((id) => svg.getElementById(id))
      .filter(Boolean);

    targets.forEach((node) => {
      node.classList.remove("fig2202-muted");
    });

    const mode = getLatestVisibleMode(slide, ".fragment.visible[data-fig2202-mode]", "fig2202Mode");
    svg.dataset.fig2202Mode = String(mode);

    if (mode === 0 || mode >= 4) {
      return;
    }

    const highlighted = new Set([stableId]);
    if (mode === 1) {
      highlighted.add("S14-S16");
    } else if (mode === 2) {
      highlighted.add("S10");
    } else if (mode >= 3) {
      highlighted.add("s17/7");
    }

    targetIds.forEach((id) => {
      const node = svg.getElementById(id);
      if (!node || highlighted.has(id)) {
        return;
      }
      node.classList.add("fig2202-muted");
    });
  }

  function syncFigure17Fragments(slide) {
    if (!slide) {
      return;
    }

    const svg = slide.querySelector("svg.embedded-svg.fig17-ready");
    if (!svg) {
      return;
    }

    const mode = getLatestVisibleMode(slide, ".fragment.visible[data-fig17-mode]", "fig17Mode");
    svg.dataset.fig17Mode = String(mode);
  }

  function syncFigure19Fragments(slide) {
    if (!slide) {
      return;
    }

    const svg = slide.querySelector("svg.embedded-svg.fig19-ready");
    if (!svg) {
      return;
    }

    const mode = getLatestVisibleMode(slide, ".fragment.visible[data-fig19-mode]", "fig19Mode");
    svg.dataset.fig19Mode = String(mode);
  }

  function syncFacetFragments(slide) {
    if (!slide) {
      return;
    }

    const svg = slide.querySelector("svg.embedded-svg.facet-anim-ready");
    if (!svg) {
      return;
    }

    const mode = getLatestVisibleMode(slide, ".fragment.visible[data-facet-mode]", "facetMode");
    svg.dataset.facetMode = String(mode);
  }

  function applyFragmentClass(fragment, add) {
    if (!window.Reveal || !Reveal.getCurrentSlide) {
      return;
    }

    const currentSlide = Reveal.getCurrentSlide();
    if (!currentSlide) {
      return;
    }

    toggleClassOnTargets(currentSlide, fragment.dataset.animTarget, fragment.dataset.animClass || "is-highlighted", add);

    const addClass = fragment.dataset.animAddClass || fragment.dataset.animClass;
    const removeClass = fragment.dataset.animRemoveClass || fragment.dataset.animClass;

    if (add) {
      toggleClassOnTargets(currentSlide, fragment.dataset.animAddTarget, addClass, true);
      toggleClassOnTargets(currentSlide, fragment.dataset.animRemoveTarget, removeClass, false);
    } else {
      toggleClassOnTargets(currentSlide, fragment.dataset.animAddTarget, addClass, false);
      toggleClassOnTargets(currentSlide, fragment.dataset.animRemoveTarget, removeClass, true);
    }
  }

  function initializeAnimator() {
    if (!window.Reveal) {
      return;
    }

    Reveal.on("fragmentshown", (event) => {
      applyFigure6Fragment(event.fragment, true);
      applyFigure2201Fragment(event.fragment, true);
      applyFragmentClass(event.fragment, true);
      syncFacetFragments(Reveal.getCurrentSlide());
      syncFigure17Fragments(Reveal.getCurrentSlide());
      syncFigure19Fragments(Reveal.getCurrentSlide());
      syncFigure2201Fragments(Reveal.getCurrentSlide());
      syncFigure2202Fragments(Reveal.getCurrentSlide());
      syncFigure23Fragments(Reveal.getCurrentSlide());
    });

    Reveal.on("fragmenthidden", (event) => {
      applyFigure6Fragment(event.fragment, false);
      applyFigure2201Fragment(event.fragment, false);
      applyFragmentClass(event.fragment, false);
      syncFacetFragments(Reveal.getCurrentSlide());
      syncFigure17Fragments(Reveal.getCurrentSlide());
      syncFigure19Fragments(Reveal.getCurrentSlide());
      syncFigure2201Fragments(Reveal.getCurrentSlide());
      syncFigure2202Fragments(Reveal.getCurrentSlide());
      syncFigure23Fragments(Reveal.getCurrentSlide());
    });

    Reveal.on("ready", (event) => {
      syncFigure6Fragments(event.currentSlide);
      syncFacetFragments(event.currentSlide);
      syncFigure17Fragments(event.currentSlide);
      syncFigure19Fragments(event.currentSlide);
      syncFigure2201Fragments(event.currentSlide);
      syncFigure2202Fragments(event.currentSlide);
      syncFigure23Fragments(event.currentSlide);
    });

    Reveal.on("slidechanged", (event) => {
      syncFigure6Fragments(event.currentSlide);
      syncFacetFragments(event.currentSlide);
      syncFigure17Fragments(event.currentSlide);
      syncFigure19Fragments(event.currentSlide);
      syncFigure2201Fragments(event.currentSlide);
      syncFigure2202Fragments(event.currentSlide);
      syncFigure23Fragments(event.currentSlide);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAnimator);
  } else {
    initializeAnimator();
  }
})();
