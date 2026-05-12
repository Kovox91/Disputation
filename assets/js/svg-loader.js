(() => {
  const parser = new DOMParser();
  let revealHandlersAttached = false;
  const FIG6_NEUTRAL_COLOR = "#cccccc";
  const DEFAULT_MUTED_OPACITY = "0.28";
  const FIG6_MIN_GROUP_SIZE = 200;
  const FIG6_TAIL_PRIORITY = ["#a58aff", "#fb61d7", "#00c094", "#d9d9d9"];

  function getMutedOpacity() {
    if (typeof window === "undefined" || typeof document === "undefined" || !document.documentElement) {
      return DEFAULT_MUTED_OPACITY;
    }

    const configured = window.getComputedStyle(document.documentElement).getPropertyValue("--fig-muted-opacity").trim();
    return configured || DEFAULT_MUTED_OPACITY;
  }

  function normalizeHexColor(value) {
    if (!value) {
      return null;
    }

    const trimmed = value.trim().toLowerCase();
    const shortAlphaMatch = trimmed.match(/^#([0-9a-f]{4})$/i);
    if (shortAlphaMatch) {
      const [r, g, b, a] = shortAlphaMatch[1].split("");
      return `#${r}${r}${g}${g}${b}${b}${a}${a}`;
    }

    const shortMatch = trimmed.match(/^#([0-9a-f]{3})$/i);
    if (shortMatch) {
      const [r, g, b] = shortMatch[1].split("");
      return `#${r}${r}${g}${g}${b}${b}`;
    }

    const longAlphaMatch = trimmed.match(/^#([0-9a-f]{8})$/i);
    if (longAlphaMatch) {
      return `#${longAlphaMatch[1]}`;
    }

    const longMatch = trimmed.match(/^#([0-9a-f]{6})$/i);
    if (longMatch) {
      return `#${longMatch[1]}`;
    }

    return null;
  }

  function getElementPaint(element, propertyName) {
    const styleValue = element.style ? element.style.getPropertyValue(propertyName) : "";
    const normalizedStyleValue = normalizeHexColor(styleValue);
    if (normalizedStyleValue) {
      return normalizedStyleValue;
    }

    const attributeValue = element.getAttribute(propertyName);
    const normalizedAttributeValue = normalizeHexColor(attributeValue);
    if (normalizedAttributeValue) {
      return normalizedAttributeValue;
    }

    const styleAttr = element.getAttribute("style") || "";
    const match = styleAttr.match(new RegExp(`${propertyName}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
    if (!match) {
      return null;
    }

    return normalizeHexColor(match[1]);
  }

  function parseNumericAttribute(element, name) {
    const value = element.getAttribute(name);
    const parsed = Number.parseFloat(value || "");
    return Number.isFinite(parsed) ? parsed : null;
  }

  function isTextLikeNode(element) {
    if (!element || !element.tagName) {
      return false;
    }

    const tagName = element.tagName.toLowerCase();
    return tagName === "text" || tagName === "tspan";
  }

  function shouldPrepareCelltypeGroups(stage) {
    if (!stage) {
      return false;
    }

    if (stage.dataset.celltypeGroups === "true") {
      return true;
    }

    const knownIds = new Set(["fig06_F_celltype", "fig18_F_celltype"]);
    return knownIds.has(stage.dataset.svgId || "");
  }

  function prepareFigure6PointGroups(stage, svgRoot) {
    if (!stage || !svgRoot || !shouldPrepareCelltypeGroups(stage)) {
      return;
    }

    const circles = Array.from(svgRoot.querySelectorAll("circle"));
    const countsByColor = new Map();
    const firstSeenColors = [];

    circles.forEach((circle) => {
      const fill = getElementPaint(circle, "fill");
      if (!fill || fill === "#000000") {
        return;
      }

      if (!countsByColor.has(fill)) {
        countsByColor.set(fill, 0);
        firstSeenColors.push(fill);
      }
      countsByColor.set(fill, countsByColor.get(fill) + 1);
    });

    const groupedColors = firstSeenColors.filter((color) => (countsByColor.get(color) || 0) >= FIG6_MIN_GROUP_SIZE);
    if (groupedColors.length === 0) {
      return;
    }

    const leadCount = Math.min(4, groupedColors.length);
    const leadingColors = groupedColors.slice(0, leadCount);
    const tailColors = groupedColors.slice(leadCount);
    const orderedTail = [
      ...FIG6_TAIL_PRIORITY.filter((color) => tailColors.includes(color)),
      ...tailColors.filter((color) => !FIG6_TAIL_PRIORITY.includes(color)),
    ];
    const orderedColors = [...leadingColors, ...orderedTail];

    const groupIndexByColor = new Map(orderedColors.map((color, index) => [color, index + 1]));

    circles.forEach((circle) => {
      const fill = getElementPaint(circle, "fill");
      if (!fill || !groupIndexByColor.has(fill)) {
        return;
      }

      const stroke = getElementPaint(circle, "stroke") || fill;
      circle.setAttribute("data-fig6-group", String(groupIndexByColor.get(fill)));
      circle.setAttribute("data-fig6-original-fill", fill);
      circle.setAttribute("data-fig6-original-stroke", stroke);
      circle.style.fill = FIG6_NEUTRAL_COLOR;
      circle.style.stroke = FIG6_NEUTRAL_COLOR;
    });

    stage.dataset.fig6GroupCount = String(orderedColors.length);
    stage.dataset.fig6NeutralColor = FIG6_NEUTRAL_COLOR;
    stage.dataset.fig6Palette = orderedColors.join(",");
  }

  const FACET_ANIM_IDS = new Set(["fig07_mrsic_DEG", "fig09_mrhel_degs"]);
  const FIG17_ID = "fig17_chloroplast_qc";
  const FIG17_FACET_IDS = ["facet1", "facet2", "facet3", "facet4"];
  const FIG19_ID = "fig19_program_correlations";
  const FIG19_FACET_IDS = ["facet1", "facet2", "facet3", "facet4"];
  const FIG2201_ID = "fig22_domains_01";
  const FIG2201_NEUTRAL_COLOR = "#cccccc";
  const FIG2201_COLOR_ORDER = [
    "#3399cc", // WUS
    "#0099ff", // CLV3
    "#0066cc", // UFO
    "#006600", // AS1
    "#336633", // AS2
    "#009900", // FIL
    "#ff6600", // LAS
    "#cc6633", // PTL
    "#ff9933", // ATML1
  ];
  const FIG2202_ID = "fig22_domains_02";
  const FIG23_ID = "fig23_program_heatmap";
  const FIG23_NEUTRAL_COLOR = "#cccccc";
  const FIG23_GROUP_IDS = ["stage1", "stage2", "stage3", "stage4", "domains", "grey1", "grey2", "grey3", "grey4"];

  function prepareFacetAnimation(stage, svgRoot) {
    if (!stage || !svgRoot || !FACET_ANIM_IDS.has(stage.dataset.svgId)) {
      return;
    }

    const groups = [
      svgRoot.getElementById("points_f1"),
      svgRoot.getElementById("points_f2"),
      svgRoot.getElementById("points_f3"),
      svgRoot.getElementById("labels_f1"),
      svgRoot.getElementById("labels_f2"),
      svgRoot.getElementById("labels_f3")
    ];

    if (!groups.every(g => g)) {
      return;
    }

    svgRoot.classList.add("facet-anim-ready");
    svgRoot.dataset.facetMode = "0";
  }

  function prepareFigure17Animation(stage, svgRoot) {
    if (!stage || !svgRoot || stage.dataset.svgId !== FIG17_ID) {
      return;
    }

    const facets = FIG17_FACET_IDS.map((id) => svgRoot.getElementById(id));
    if (!facets.every((facet) => facet) || !svgRoot.querySelector(".fig17-teal")) {
      return;
    }

    svgRoot.classList.add("fig17-ready");
    svgRoot.dataset.fig17Mode = "0";
  }

  function prepareFigure19Animation(stage, svgRoot) {
    if (!stage || !svgRoot || stage.dataset.svgId !== FIG19_ID) {
      return;
    }

    const facets = FIG19_FACET_IDS.map((id) => svgRoot.getElementById(id));
    const labels = svgRoot.getElementById("cluster_label");
    if (!facets.every((facet) => facet) || !labels) {
      return;
    }

    svgRoot.classList.add("fig19-ready");
    svgRoot.dataset.fig19Mode = "0";
  }

  function prepareFigure2201ColorGroups(stage, svgRoot) {
    if (!stage || !svgRoot || stage.dataset.svgId !== FIG2201_ID) {
      return;
    }

    const groupIndexByColor = new Map(FIG2201_COLOR_ORDER.map((color, index) => [color, index + 1]));
    let touchedNodes = 0;

    const allNodes = Array.from(svgRoot.querySelectorAll("*"));
    allNodes.forEach((node) => {
      const fill = getElementPaint(node, "fill");
      const stroke = getElementPaint(node, "stroke");
      const fillGroup = fill ? groupIndexByColor.get(fill) : null;
      const strokeGroup = stroke ? groupIndexByColor.get(stroke) : null;
      const group = fillGroup || strokeGroup;

      if (!group) {
        return;
      }

      const originalFill = fill || "";
      const originalStroke = stroke || "";
      node.setAttribute("data-fig2201-group", String(group));
      node.setAttribute("data-fig2201-original-fill", originalFill);
      node.setAttribute("data-fig2201-original-stroke", originalStroke);

      if (fillGroup) {
        node.style.fill = FIG2201_NEUTRAL_COLOR;
      }
      if (strokeGroup) {
        node.style.stroke = FIG2201_NEUTRAL_COLOR;
      }
      touchedNodes += 1;
    });

    if (touchedNodes === 0) {
      return;
    }

    stage.dataset.fig2201GroupCount = String(FIG2201_COLOR_ORDER.length);
    stage.dataset.fig2201NeutralColor = FIG2201_NEUTRAL_COLOR;
  }

  function prepareFigure2202Animation(stage, svgRoot) {
    if (!stage || !svgRoot || stage.dataset.svgId !== FIG2202_ID) {
      return;
    }

    const stableNode = svgRoot.getElementById("stable") || svgRoot.getElementById("g1549918");
    const s1416Node = svgRoot.getElementById("S14-S16");
    const s10Node = svgRoot.getElementById("S10");
    const s177Node = svgRoot.getElementById("s17/7");

    if (!stableNode || !s1416Node || !s10Node || !s177Node) {
      return;
    }

    svgRoot.classList.add("fig2202-ready");
    svgRoot.dataset.fig2202Mode = "0";
    svgRoot.dataset.fig2202StableId = stableNode.id;
  }

  function setFigure23Membership(node, groupId) {
    const existing = (node.getAttribute("data-fig23-groups") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (!existing.includes(groupId)) {
      existing.push(groupId);
      node.setAttribute("data-fig23-groups", existing.join(","));
    }
  }

  function getElementOpacityValue(element) {
    const styleValue = element.style ? element.style.getPropertyValue("opacity") : "";
    if (styleValue) {
      return styleValue;
    }

    return element.getAttribute("opacity") || "";
  }

  function prepareFigure23Animation(stage, svgRoot) {
    if (!stage || !svgRoot || stage.dataset.svgId !== FIG23_ID) {
      return;
    }

    const groups = FIG23_GROUP_IDS.map((id) => svgRoot.getElementById(id));
    if (!groups.every((group) => group)) {
      return;
    }

    const knownGroupIds = new Set(FIG23_GROUP_IDS);
    const parentByNode = new Map();
    Array.from(svgRoot.querySelectorAll("*")).forEach((node) => {
      Array.from(node.children).forEach((child) => {
        parentByNode.set(child, node);
      });
    });

    const mutedOpacity = getMutedOpacity();
    let touchedNodes = 0;
    Array.from(svgRoot.querySelectorAll("*")).forEach((node) => {
      const memberships = [];
      let currentNode = node;
      while (currentNode) {
        const currentId = currentNode.getAttribute ? currentNode.getAttribute("id") : null;
        if (currentId && knownGroupIds.has(currentId) && !memberships.includes(currentId)) {
          memberships.push(currentId);
        }
        currentNode = parentByNode.get(currentNode) || null;
      }

      if (memberships.length === 0) {
        return;
      }

      const fill = getElementPaint(node, "fill");
      const stroke = getElementPaint(node, "stroke");
      const isTextLike = isTextLikeNode(node);
      if (!fill && !stroke && !isTextLike) {
        return;
      }

      if (!node.hasAttribute("data-fig23-original-fill")) {
        node.setAttribute("data-fig23-original-fill", fill || "");
        node.setAttribute("data-fig23-original-stroke", stroke || "");
        node.setAttribute("data-fig23-original-opacity", getElementOpacityValue(node));
        if (isTextLike) {
          node.setAttribute("data-fig23-text-like", "true");
        }

        if (fill || isTextLike) {
          node.style.fill = FIG23_NEUTRAL_COLOR;
        }
        if (stroke) {
          node.style.stroke = FIG23_NEUTRAL_COLOR;
        }
        node.style.opacity = mutedOpacity;
        touchedNodes += 1;
      }

      node.setAttribute("data-fig23-groups", memberships.join(","));
    });

    if (touchedNodes === 0) {
      return;
    }

    svgRoot.classList.add("fig23-ready");
    svgRoot.dataset.fig23Mode = "0";
    stage.dataset.fig23NeutralColor = FIG23_NEUTRAL_COLOR;
  }

  async function loadInlineSvg(stage) {
    const src = stage.dataset.svgSrc;
    if (!src || stage.dataset.loadStatus === "ready") {
      return;
    }

    stage.dataset.loadStatus = "loading";
    stage.dataset.loadMessage = "Loading SVG...";

    try {
      const response = await fetch(src, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const doc = parser.parseFromString(text, "image/svg+xml");
      const svg = doc.documentElement;

      if (!svg || svg.tagName.toLowerCase() !== "svg") {
        throw new Error("No SVG root element found");
      }

      const idPrefix = stage.dataset.svgId;
      if (idPrefix && !svg.id) {
        svg.id = idPrefix;
      }

      svg.classList.add("embedded-svg");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      stage.innerHTML = "";
      const importedSvg = document.importNode(svg, true);
      prepareFigure6PointGroups(stage, importedSvg);
      prepareFacetAnimation(stage, importedSvg);
      prepareFigure17Animation(stage, importedSvg);
      prepareFigure19Animation(stage, importedSvg);
      prepareFigure2201ColorGroups(stage, importedSvg);
      prepareFigure2202Animation(stage, importedSvg);
      prepareFigure23Animation(stage, importedSvg);
      stage.appendChild(importedSvg);
      stage.dataset.loadStatus = "ready";
      stage.dataset.loadMessage = "";
    } catch (error) {
      stage.dataset.loadStatus = "error";
      stage.dataset.loadMessage = `SVG failed to load: ${src}`;
      console.error("[svg-loader]", error);
    }
  }

  async function loadAllOnSlide(slide) {
    const stages = Array.from(slide.querySelectorAll(".svg-stage[data-svg-src]"));
    await Promise.all(stages.map(loadInlineSvg));
  }

  async function initializeSvgSlides() {
    const allStages = Array.from(document.querySelectorAll(".svg-stage[data-svg-src]"));

    await Promise.all(allStages.map(loadInlineSvg));

    if (!window.Reveal || !Reveal.on || revealHandlersAttached) {
      return;
    }

    revealHandlersAttached = true;

    Reveal.on("ready", async (event) => {
      await loadAllOnSlide(event.currentSlide);
    });

    Reveal.on("slidechanged", async (event) => {
      await loadAllOnSlide(event.currentSlide);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSvgSlides);
  } else {
    initializeSvgSlides();
  }
})();
