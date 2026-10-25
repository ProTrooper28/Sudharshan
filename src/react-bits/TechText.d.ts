/**
 * Types for the React Bits TechText component (JavaScript + CSS variant).
 *
 * The implementation lives in TechText.jsx and is kept byte-faithful to the
 * upstream source so a future update from reactbits.dev is a straight copy.
 * This shim exists only because the app compiles with `strict` and `allowJs`
 * is off: TypeScript resolves the import here, Vite resolves the .jsx.
 */
import type { CSSProperties, ReactElement } from 'react';

export type TechTextProps = {
  /** The wordmark to render. */
  text?: string;
  /** Any font family loaded on the page. Empty inherits the container's font. */
  fontFamily?: string;
  /** Weight of the wordmark. */
  fontWeight?: number;
  /** Largest font size in px; the wordmark shrinks to fit narrower containers. */
  fontSize?: number;
  /** Extra space between letters, in em. */
  letterSpacing?: number;
  /** Where the wordmark sits across the container. */
  align?: 'left' | 'center' | 'right';
  /** Colour of the letters and their outlines. Follows text colour by default. */
  color?: string;
  /** Colour of the selection frame, connector, specks and labels. */
  accentColor?: string;
  /** Area fades letters into outlines around the pointer, letter turns the active letter only, off keeps them solid. */
  reveal?: 'area' | 'letter' | 'off';
  /** Radius around the pointer where letters turn into outlines, in px. */
  reach?: number;
  /** How gradually the fill hands over to the outlines. 0 is a hard edge. */
  softness?: number;
  /** Length of each outline dash, in px. */
  dashLength?: number;
  /** Space between outline dashes, in px. */
  dashGap?: number;
  /** Thickness of the outline, in px. */
  strokeWidth?: number;
  /** How outlines under the pointer are drawn. */
  lineStyle?: 'dashed' | 'solid';
  /** Tiny squares that blink around the active letter. 0 turns them off. */
  specks?: number;
  /** Frame the letter under the pointer. */
  selection?: boolean;
  /** Label the frame with the letter and its size, or its offset while dragged. */
  labels?: boolean;
  /** Let letters be dragged off the baseline; they spring back on release. */
  draggable?: boolean;
  /** How much a released letter overshoots on its way home, 0 to 1. */
  bounce?: number;
  /** Sweep the reveal across the wordmark on its own while the pointer is away. */
  sweep?: boolean;
  /** Speed of the idle sweep. */
  speed?: number;
  /** Clicking a letter kicks it upward on its spring and ripples its neighbours. */
  clickKick?: boolean;
  /** Entrance played once the wordmark is in view. */
  intro?: 'none' | 'type' | 'assemble' | 'metrics';
  /** Length of the intro, in seconds. */
  introDuration?: number;
  /** Rule the baseline, x-height, cap height and descender while a letter is active. */
  guides?: boolean;
  /** Extra classes on the container. */
  className?: string;
  /** Inline styles on the container. */
  style?: CSSProperties;
};

declare const TechText: (props: TechTextProps) => ReactElement;

export default TechText;
