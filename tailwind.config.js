/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-low": "#1a1c1c",
        "on-surface-variant": "#c4c7c7",
        "on-secondary-fixed-variant": "#6d3a00",
        "on-primary-fixed-variant": "#474746",
        "on-primary-fixed": "#1c1b1b",
        "outline-variant": "#444748",
        "on-surface": "#e2e2e2",
        "on-secondary-container": "#ffb270",
        "surface-container": "#1e2020",
        "on-secondary-fixed": "#2e1500",
        "surface-bright": "#37393a",
        "inverse-surface": "#e2e2e2",
        "secondary-container": "#7a4100",
        "on-secondary": "#4d2700",
        "surface": "#121414",
        "on-primary": "#313030",
        "on-tertiary-container": "#838282",
        "primary": "#c8c6c5",
        "on-tertiary": "#303030",
        "surface-container-high": "#282a2b",
        "tertiary-fixed": "#e4e2e1",
        "on-tertiary-fixed": "#1b1c1c",
        "surface-tint": "#c8c6c5",
        "surface-container-lowest": "#0c0f0f",
        "outline": "#8e9192",
        "primary-fixed-dim": "#c8c6c5",
        "tertiary": "#c8c6c6",
        "on-tertiary-fixed-variant": "#474747",
        "on-error-container": "#ffdad6",
        "surface-container-highest": "#333535",
        "secondary": "#ffb77b",
        "error-container": "#93000a",
        "secondary-fixed": "#ffdcc2",
        "primary-container": "#1a1a1a",
        "on-primary-container": "#848282",
        "inverse-primary": "#5f5e5e",
        "surface-variant": "#333535",
        "tertiary-fixed-dim": "#c8c6c6",
        "inverse-on-surface": "#2f3131",
        "error": "#ffb4ab",
        "background": "#121414",
        "on-error": "#690005",
        "on-background": "#e2e2e2",
        "surface-dim": "#121414"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "margin-desktop": "64px",
        "gutter": "24px",
        "container-max": "1280px",
        "margin-mobile": "24px",
        "unit": "8px",
        "section-gap": "120px"
      },
      fontFamily: {
        "label-caps": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "menu-item": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg-mobile": ["Space Grotesk", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.15em", "fontWeight": "600"}],
        "display-lg": ["64px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "headline-md": ["32px", {"lineHeight": "1.3", "fontWeight": "700"}],
        "menu-item": ["20px", {"lineHeight": "1.5", "letterSpacing": "0.05em", "fontWeight": "300"}],
        "body-sm": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "display-lg-mobile": ["40px", {"lineHeight": "1.2", "fontWeight": "800"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
