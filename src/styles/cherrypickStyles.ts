import {
  INTER_REGULAR_B64,
  INTER_MEDIUM_B64,
  INTER_SEMIBOLD_B64,
  INTER_BOLD_B64,
} from './inter-base64';

export const CHERRYPICK_CSS = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Inter Regular'), local('Inter-Regular'), local('Inter'),
       url('data:font/woff2;base64,${INTER_REGULAR_B64}') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Inter Medium'), local('Inter-Medium'),
       url('data:font/woff2;base64,${INTER_MEDIUM_B64}') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Inter SemiBold'), local('Inter-SemiBold'),
       url('data:font/woff2;base64,${INTER_SEMIBOLD_B64}') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Inter Bold'), local('Inter-Bold'),
       url('data:font/woff2;base64,${INTER_BOLD_B64}') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: local('Inter ExtraBold'), local('Inter-ExtraBold'), local('Inter Bold'), local('Inter-Bold'),
       url('data:font/woff2;base64,${INTER_BOLD_B64}') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: local('Inter Black'), local('Inter-Black'), local('Inter Bold'), local('Inter-Bold'),
       url('data:font/woff2;base64,${INTER_BOLD_B64}') format('woff2');
}

:host, .cp-root {
  font-family: 'Inter', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
  color: #FFFFFF;
  user-select: none;
}

.cp-root *, .cp-card, .cp-card * {
  font-family: 'Inter', sans-serif !important;
}

.cp-root *, .cp-root *::before, .cp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cp-text-selector-btn {
  position: relative;
  background: transparent;
  border: none;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.42);
  cursor: pointer;
  transition: color 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Inter', sans-serif !important;
  outline: none;
  user-select: none;
  white-space: nowrap;
}

.cp-text-selector-btn:hover {
  color: #111111;
  background: transparent;
  transform: translateY(-1px);
}

.cp-text-selector-btn:active {
  transform: scale(0.96);
  background: transparent;
}

.cp-text-selector-btn.active {
  color: #111111;
  font-weight: 600;
  background: transparent;
  box-shadow: none;
}

.cp-text-selector-btn::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #111111;
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease;
  opacity: 0;
}

.cp-text-selector-btn.active::after {
  transform: scaleX(1);
  opacity: 1;
}

.cp-card,
.cp-card *,
.cp-card *::before,
.cp-card *::after {
  box-sizing: border-box;
}

/* Primary Outer Frame (394px wide, border-radius 24px, #0F1013) */
.cp-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 16px;
  position: relative;
  width: 394px;
  background: #0F1013;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  transition: height 0.44s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: height;
}

.cp-card-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.cp-card-onboarding {
  width: 394px;
  border-radius: 24px;
}

.cp-scroll-clean {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cp-scroll-clean::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* When rendered inside popup.html, preserve 24px rounded corners and equal 16px outer padding */
.cp-native-popup-root .cp-card {
  min-height: 0 !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75), 0 0 0 1.5px rgba(255, 255, 255, 0.12) !important;
}

.cp-card-toast {
  width: 394px;
  border-radius: 16px;
}

.cp-card-clutch {
  background: radial-gradient(89.17% 100% at 50.86% 0%, rgba(255, 206, 126, 0.2) 0%, rgba(15, 16, 19, 0.2) 100%), #0F1013;
}

.cp-card-overtime {
  background: #0F1013;
}

/* Row Utilities */
.cp-row-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.cp-row-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.cp-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

/* Team Square Badge (Frame 2: 18x18px, border-radius 4px) */
.cp-team-square {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Team Abbr (PHI, NYK: Inter 800, 24px, line-height 29px) */
.cp-team-abbr {
  font-family: 'Inter', sans-serif !important;
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 29px;
  color: #FFFFFF;
  letter-spacing: -0.01em;
}

/* Possession dot (ball 2: 6x6px white circle) */
.cp-possession-dot {
  width: 6px;
  height: 6px;
  background: #FFFFFF;
  border-radius: 42px;
  flex-shrink: 0;
}

/* Live pulsing indicator (ball 4 + ball 3) */
.cp-live-badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.cp-live-dot-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 15px;
  height: 15px;
  background: #401C21;
  border-radius: 42px;
  flex-shrink: 0;
  animation: cp-pulse 2s infinite ease-in-out;
}

.cp-live-dot-inner {
  width: 6px;
  height: 6px;
  background: #E04F54;
  border-radius: 42px;
}

@keyframes cp-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.14); opacity: 0.85; }
}

.cp-live-text {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.04em;
  color: #E04F54;
}

.cp-live-clock-red {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #E04F54;
}

/* Pills (CLUTCH, MY TEAM, RUN, MVP, OVERTIME, TIP-OFF, LEAD CHANGE) */
.cp-pill {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
  height: 25px;
  border-radius: 39px;
  font-family: 'Inter', sans-serif !important;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  white-space: nowrap;
  flex-shrink: 0;
}

.cp-pill-gold {
  background: #FFCE7E;
  color: #0F1013;
}

.cp-pill-white {
  background: #FFFFFF;
  color: #000000;
}

.cp-pill-team {
  color: #FFFFFF;
}

/* Typography tokens */
.cp-text-muted {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #9B9CA6;
}

.cp-text-dim {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #5C5C65;
}

.cp-text-white-14 {
  font-family: 'Inter', sans-serif !important;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
}

.cp-text-white-14-semi {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
}

.cp-clutch-clock {
  font-family: 'Inter', sans-serif !important;
  font-weight: 800;
  font-size: 24px;
  line-height: 29px;
  color: #FFCE7E;
}

.cp-heading-24 {
  font-family: 'Inter', sans-serif !important;
  font-weight: 800;
  font-size: 24px;
  line-height: 29px;
  color: #FFFFFF;
}

/* Big 48px Scores (Frames 1, 46, 3, 4, 5, 47, 6) */
.cp-score-48 {
  font-family: 'Inter', sans-serif !important;
  font-style: normal;
  font-weight: 800;
  font-size: 48px;
  line-height: 58px;
  font-variant-numeric: normal;
}

.cp-score-leading {
  color: #FFFFFF;
}

.cp-score-trailing {
  color: #9B9CA6;
}

/* 24px Scores (List cards & Toast cards) */
.cp-score-24 {
  font-family: 'Inter', sans-serif !important;
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 29px;
  font-variant-numeric: normal;
}

/* Momentum Bar (Frame 11: 362x8px, #23252C, center tick at 185px) */
.cp-momentum-wrap {
  position: relative;
  width: 100%;
  height: 8px;
  display: flex;
  align-items: center;
  isolation: isolate;
}

.cp-momentum-track {
  width: 100%;
  height: 8px;
  background: #23252C;
  border-radius: 39px;
  position: relative;
  z-index: 0;
}

.cp-momentum-fill {
  position: absolute;
  top: 0;
  height: 8px;
  z-index: 1;
}

.cp-momentum-tick {
  position: absolute;
  width: 3px;
  height: 10px;
  left: 185px;
  top: -1px;
  background: #9B9CA6;
  border-radius: 26px;
  z-index: 2;
}

/* Expanded Chart Box (Frame 22: 362x124px, #15161A, border-radius 16px) */
.cp-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.cp-chart-box {
  position: relative;
  width: 100%;
  height: 124px;
  background: #15161A;
  border-radius: 16px;
  overflow: hidden;
}

.cp-chart-quarters {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 303px;
  height: 17px;
}

/* Card Step Transition Animation */
@keyframes cp-card-step-enter {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}

.cp-step-card-anim {
  animation: cp-card-step-enter 0.36s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}

/* Inner Surface Cards (Frame 40/41/42/43/51: #15161A, border-radius 16px) */
.cp-surface-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 16px;
  width: 100%;
  background: #15161A;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease, box-shadow 0.22s ease, border-color 0.2s ease;
  will-change: transform;
}

.cp-surface-card:hover {
  background: #1C1D23;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.cp-surface-card:active {
  transform: scale(0.985);
}

.cp-surface-card-active {
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.26), 0 8px 24px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.28);
  animation: cp-card-select-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cp-card-select-pop {
  0% { transform: scale(0.985); }
  50% { transform: scale(1.012); }
  100% { transform: scale(1); }
}

/* Hero My Team Card inside Popup (Frame 36: 362px wide, padding 16px, border-radius 16px) */
.cp-hero-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 16px;
  width: 100%;
  background: #0F1013;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.22s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
  will-change: transform;
}

.cp-hero-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55);
}

.cp-hero-card:active {
  transform: scale(0.99);
}

/* Settings Button (Frame 49: 51x51px, #15161A, border-radius 16px) */
.cp-icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 51px;
  height: 51px;
  background: #15161A;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  color: #FFFFFF;
  transition: background 0.2s ease, transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cp-icon-btn:hover {
  background: #24252D;
  transform: rotate(45deg) scale(1.06);
}

.cp-icon-btn:active {
  transform: rotate(90deg) scale(0.94);
}

/* Back Arrow Button inside Game Card Header (returns to game schedule) */
.cp-back-arrow-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  background: #15161A;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  color: #FFFFFF;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.18s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.18s ease;
}

.cp-back-arrow-btn:hover {
  background: #23252C;
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-3px) scale(1.08);
}

.cp-back-arrow-btn:active {
  transform: translateX(-4px) scale(0.92);
}

/* Primary Pill Button (357x49px, border-radius 39px) */
.cp-primary-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 8px;
  gap: 8px;
  width: 100%;
  height: 49px;
  background: #FFFFFF;
  color: #0F1013;
  border-radius: 39px;
  border: none;
  font-family: 'Inter', sans-serif !important;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, opacity 0.18s ease;
  will-change: transform;
  position: relative;
  overflow: hidden;
}

.cp-primary-btn:hover {
  transform: translateY(-2px) scale(1.015);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  opacity: 0.96;
}

.cp-primary-btn:active {
  transform: translateY(0) scale(0.975);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* Search Input Box (Frame 6 in Step 1: 357x49px, #15161A, border-radius 39px) */
.cp-search-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  width: 100%;
  height: 49px;
  background: #15161A;
  border-radius: 39px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.cp-search-box:focus-within {
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.cp-search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-family: 'Inter', sans-serif !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #FFFFFF;
}

.cp-search-input::placeholder {
  color: #9B9CA6;
}

/* Team Selection 3-Column Grid (Frame 64: 357x256px scrollable for all 30 NBA teams) */
.cp-team-grid {
  display: grid;
  grid-template-columns: repeat(3, 92.33px);
  justify-content: space-between;
  row-gap: 22px;
  width: 100%;
  max-height: 256px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 4px;
  margin: -6px -4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cp-team-grid::-webkit-scrollbar {
  display: none;
}

.cp-team-tile {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 8px;
  gap: 8px;
  width: 92.33px;
  height: 45px;
  background: #15161A;
  border-radius: 16px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, box-shadow 0.22s ease, border-color 0.2s ease;
  will-change: transform;
}

.cp-team-tile:hover {
  background: #1C1D23;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
}

.cp-team-tile:active {
  transform: scale(0.94);
}

.cp-team-tile-selected {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5) !important;
  animation: cp-tile-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cp-tile-pop {
  0% { transform: scale(0.94); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.cp-team-tile-selected .cp-team-square {
  animation: cp-square-pulse 0.36s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cp-square-pulse {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

/* Toggle Switch (Frame 74: 43x24px, border-radius 34px; knob 20x20px) */
.cp-toggle-track {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 2px;
  width: 43px;
  height: 24px;
  border-radius: 34px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cp-toggle-track:hover {
  transform: scale(1.06);
}

.cp-toggle-track:active {
  transform: scale(0.94);
}

.cp-toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 34px;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.22s ease, width 0.18s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.cp-surface-card:active .cp-toggle-knob {
  width: 23px;
}

/* Floating Widget Controls Bar (subtle hover action bar on Floating PiP) */
.cp-floating-wrapper {
  position: fixed;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  gap: 10px;
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.55));
}

.cp-floating-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(21, 22, 26, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  opacity: 0.92;
  transition: opacity 0.18s ease, transform 0.18s ease;
  pointer-events: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
}

.cp-floating-wrapper:hover .cp-floating-toolbar {
  opacity: 1;
}

.cp-mini-action-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 5px 12px;
  font-family: 'Inter', sans-serif !important;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s ease, border-color 0.18s ease, box-shadow 0.2s ease;
  will-change: transform;
}

.cp-mini-action-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-1.5px) scale(1.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.cp-mini-action-btn:active {
  transform: scale(0.92);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.cp-mini-action-btn-active {
  background: #FFCE7E;
  color: #0F1013;
  border-color: #FFCE7E;
  box-shadow: 0 0 12px rgba(255, 206, 126, 0.45);
  animation: cp-tile-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* =========================================================
   Callout & Event Animations (Scoring, Fouls, Plays, Scores)
   ========================================================= */

@keyframes cp-score-callout-in {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
    color: #FFFFFF;
    text-shadow: 0 0 12px rgba(255, 206, 126, 0.55);
  }
  55% {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
    color: #FFFFFF;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    text-shadow: none;
  }
}

@keyframes cp-foul-callout-in {
  0% {
    opacity: 0;
    transform: translateX(-8px);
    color: #E04F54;
  }
  25% {
    opacity: 1;
    transform: translateX(6px);
    color: #E04F54;
  }
  50% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(2px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes cp-play-callout-in {
  0% {
    opacity: 0;
    transform: translateX(12px) translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

@keyframes cp-play-cascade-down {
  0% {
    opacity: 0.65;
    transform: translateY(-12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cp-score-number-bump {
  0% {
    transform: translateY(8px) scale(0.92);
    filter: brightness(1.35);
  }
  50% {
    transform: translateY(-3px) scale(1.08);
    filter: brightness(1.15);
  }
  100% {
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
}

@keyframes cp-run-pill-pop {
  0% {
    opacity: 0;
    transform: scale(0.82) translateY(5px);
  }
  65% {
    opacity: 1;
    transform: scale(1.05) translateY(-1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes cp-dot-pop-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.35);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cp-toast-enter {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cp-anim-score-callout {
  animation: cp-score-callout-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cp-anim-foul-callout {
  animation: cp-foul-callout-in 0.46s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.cp-anim-play-callout {
  animation: cp-play-callout-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.cp-anim-play-cascade {
  animation: cp-play-cascade-down 0.36s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.cp-anim-score-bump {
  display: inline-block;
  animation: cp-score-number-bump 0.46s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.cp-anim-run-pill {
  animation: cp-run-pill-pop 0.44s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.cp-possession-dot {
  animation: cp-dot-pop-in 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.cp-card-toast {
  animation: cp-toast-enter 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Smooth Clutch & Phase Glow Overlay + Clutch Pill Pop */
.cp-card > *:not(.cp-card-glow-layer),
.cp-hero-card > *:not(.cp-card-glow-layer) {
  position: relative;
  z-index: 1;
}

.cp-hero-card {
  position: relative;
  overflow: hidden;
}

.cp-card-glow-layer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}

.cp-card-glow-layer-active {
  opacity: 1;
  animation: cp-clutch-glow-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cp-clutch-glow-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(-6px);
  }
  55% {
    opacity: 1;
    transform: scale(1.02) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes cp-clutch-pill-pop {
  0% {
    opacity: 0;
    transform: scale(0.58) translateY(8px);
    box-shadow: 0 0 24px rgba(255, 206, 126, 0.85);
  }
  65% {
    opacity: 1;
    transform: scale(1.09) translateY(-1px);
    box-shadow: 0 0 14px rgba(255, 206, 126, 0.45);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    box-shadow: 0 0 0 rgba(255, 206, 126, 0);
  }
}

@keyframes cp-clutch-clock-in {
  0% {
    opacity: 0;
    transform: translateY(6px) scale(0.95);
    text-shadow: 0 0 14px rgba(255, 206, 126, 0.7);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    text-shadow: none;
  }
}

.cp-anim-clutch-pill {
  animation: cp-clutch-pill-pop 0.54s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.cp-anim-clutch-clock {
  animation: cp-clutch-clock-in 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
  font-variant-numeric: tabular-nums;
}

.cp-clutch-clock,
.cp-live-clock-red {
  font-variant-numeric: tabular-nums;
}

/* =========================================================
   Card Expand & Collapse Morph Animations
   ========================================================= */

@keyframes cp-expand-header-morph {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cp-expand-section-reveal {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cp-compact-body-morph {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cp-anim-expand-header {
  animation: cp-expand-header-morph 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cp-anim-expand-chart {
  animation: cp-expand-section-reveal 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.04s both;
}

.cp-anim-expand-plays {
  animation: cp-expand-section-reveal 0.44s cubic-bezier(0.22, 1, 0.36, 1) 0.09s both;
}

.cp-anim-expand-leaders {
  animation: cp-expand-section-reveal 0.46s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both;
}

.cp-anim-compact-body {
  animation: cp-compact-body-morph 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = typeof atob !== 'undefined' ? atob(base64.trim()) : '';
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

let interFontsLoadingPromise: Promise<boolean> | null = null;

export function ensureInterFontsLoaded(): Promise<boolean> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) {
    return Promise.resolve(false);
  }

  if (document.fonts.check('14px Inter') && document.fonts.check('600 14px Inter') && document.fonts.check('800 14px Inter')) {
    return Promise.resolve(true);
  }

  if (interFontsLoadingPromise) {
    return interFontsLoadingPromise;
  }

  interFontsLoadingPromise = (async () => {
    try {
      // 1. Force load any existing CSS @font-face rules registered on document.fonts
      document.fonts.forEach((face) => {
        if (face.family.replace(/['"]/g, '') === 'Inter' && face.status === 'unloaded') {
          face.load().catch(() => {});
        }
      });

      // 2. Register in-memory binary FontFace objects for all weights
      const fontDefs = [
        { weight: '400', b64: INTER_REGULAR_B64, file: 'Inter-Regular.woff2' },
        { weight: '500', b64: INTER_MEDIUM_B64, file: 'Inter-Medium.woff2' },
        { weight: '600', b64: INTER_SEMIBOLD_B64, file: 'Inter-SemiBold.woff2' },
        { weight: '700', b64: INTER_BOLD_B64, file: 'Inter-Bold.woff2' },
        { weight: '800', b64: INTER_BOLD_B64, file: 'Inter-ExtraBold.woff2' },
        { weight: '900', b64: INTER_BOLD_B64, file: 'Inter-Black.woff2' },
      ];

      const loadTasks = fontDefs.map(async (def) => {
        try {
          const bytes = base64ToUint8Array(def.b64);
          const face = new FontFace('Inter', bytes.buffer as ArrayBuffer, {
            weight: def.weight,
            style: 'normal',
            display: 'swap',
          });
          const loaded = await face.load();
          try {
            document.fonts.add(loaded);
          } catch {}
        } catch {
          // If in-memory FontFace fails, try chrome.runtime.getURL if available
          if (typeof chrome !== 'undefined' && chrome.runtime?.id && chrome.runtime?.getURL) {
            try {
              const extFace = new FontFace('Inter', `url(${chrome.runtime.getURL(`fonts/${def.file}`)})`, {
                weight: def.weight,
                style: 'normal',
                display: 'swap',
              });
              const loadedExt = await extFace.load();
              try {
                document.fonts.add(loadedExt);
              } catch {}
            } catch {}
          }
        }
      });

      await Promise.allSettled(loadTasks);

      // 3. Trigger document font resolver so ready status is confirmed
      await Promise.allSettled([
        document.fonts.load('400 14px Inter'),
        document.fonts.load('500 14px Inter'),
        document.fonts.load('600 14px Inter'),
        document.fonts.load('700 14px Inter'),
        document.fonts.load('800 14px Inter'),
        document.fonts.load('900 14px Inter'),
      ]);

      return document.fonts.check('14px Inter');
    } catch (e) {
      console.warn('[CherryPick] Font loading warning:', e);
      return false;
    }
  })();

  return interFontsLoadingPromise;
}

export function injectStylesInto(target: Document | ShadowRoot) {
  ensureInterFontsLoaded();
  const id = 'cherrypick-styles';
  if (target instanceof Document) {
    if (target.getElementById(id)) return;
    const style = target.createElement('style');
    style.id = id;
    style.textContent = CHERRYPICK_CSS;
    target.head.appendChild(style);
  } else {
    try {
      if (typeof document !== 'undefined' && document.head && !document.getElementById('cherrypick-fonts')) {
        const fontStyle = document.createElement('style');
        fontStyle.id = 'cherrypick-fonts';
        const fontCut = CHERRYPICK_CSS.indexOf(':host, .cp-root');
        fontStyle.textContent = fontCut !== -1 ? CHERRYPICK_CSS.slice(0, fontCut) : CHERRYPICK_CSS;
        document.head.appendChild(fontStyle);
      }
    } catch {}

    if (target.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = CHERRYPICK_CSS;
    target.appendChild(style);
  }
}

