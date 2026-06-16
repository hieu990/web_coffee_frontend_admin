import React from "react";
import { PageFlip } from "page-flip";

/**
 * HTMLFlipBook - React wrapper for page-flip library.
 *
 * Key design decisions:
 * - useMouseEvents: FALSE  → page-flip's internal click/drag handler is disabled.
 *   This prevents double-fire: if both page-flip AND our React onClick both call
 *   flipNext(), the flip command fires twice → stutter/khựng. We handle all
 *   navigation from React (buttons + keyboard). Drag-to-flip is intentionally
 *   disabled because it conflicts with page scrolling on mobile too.
 *
 * - flippingTime: 550ms   → feels snappy yet shows the full curl arc.
 *   700ms was too slow and made the animation feel "heavy".
 *
 * - drawShadow: true       → enables page-flip's built-in gradient shadow on
 *   the curling page, which is the primary visual cue of depth.
 *
 * - maxShadowOpacity: 0.65 → strong enough shadow to see the curl clearly
 *   against the dark background.
 */
export default class HTMLFlipBook extends React.Component {
  constructor(props) {
    super(props);
    this.el = null;
    this.pageFlip = null;
  }

  componentDidMount() {
    if (!this.el) return;

    // Use requestAnimationFrame instead of setTimeout so we wait for the
    // browser to have already painted the children before page-flip reads
    // their dimensions. This avoids a race condition that caused the cover
    // to "snap" on first open.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._initPageFlip();
      });
    });
  }

  _initPageFlip() {
    try {
      const pages = Array.from(this.el.querySelectorAll(".page"));
      if (pages.length === 0) {
        console.warn("[HTMLFlipBook] No .page elements found in container");
        return;
      }

      const defaults = {
        // Animation
        flippingTime: 550,       // ms — snappy but shows full curl
        // Shadow / depth
        drawShadow: true,
        maxShadowOpacity: 0.65,
        // Interaction — IMPORTANT: keep useMouseEvents FALSE to prevent
        // double-flip when React onClick also calls flipNext/flipPrev.
        useMouseEvents: false,
        // Layout
        autoSize: true,
        startZIndex: 0,
        usePortrait: false,
        showCover: true,
        mobileScrollSupport: true,
        // Forward clicks through to child React elements (buttons, etc.)
        clickEventForward: true,
      };

      // Consumer props override defaults (width, height, size, min/max, etc.)
      const opts = { ...defaults, ...this.props };

      this.pageFlip = new PageFlip(this.el, opts);
      this.pageFlip.loadFromHTML(pages);

      // Notify parent that the book is ready — used to hide skeleton loader.
      // Use rAF so the flip canvas has painted at least one frame first.
      requestAnimationFrame(() => {
        if (this.props.onReady) this.props.onReady();
      });

      if (this.props.onFlip)
        this.pageFlip.on("flip", (e) => this.props.onFlip(e));

      if (this.props.onChangeOrientation)
        this.pageFlip.on("changeOrientation", (e) =>
          this.props.onChangeOrientation(e)
        );

      if (this.props.onChangeState)
        this.pageFlip.on("changeState", (e) => this.props.onChangeState(e));

    } catch (err) {
      console.error("[HTMLFlipBook] Failed to initialize page-flip:", err);
    }
  }

  componentWillUnmount() {
    if (this.pageFlip) {
      try {
        this.pageFlip.destroy();
      } catch (_) {}
      this.pageFlip = null;
    }
  }

  getPageFlip() {
    return this.pageFlip;
  }

  render() {
    return (
      <div
        ref={(el) => (this.el = el)}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}
