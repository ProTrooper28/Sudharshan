/**
 * Types for the React Bits WebThreads component (JavaScript + CSS variant).
 *
 * The implementation lives in WebThreads.jsx and is kept byte-faithful to the
 * upstream source so a future update from reactbits.dev is a straight copy.
 * This shim exists only because the app compiles with `strict` and `allowJs`
 * is off: TypeScript resolves the import here, Vite resolves the .jsx.
 */
import type { CSSProperties, ReactElement } from 'react';

export type WebThreadsProps = {
  /** Gradient across the threads, first thread to last. Up to six colours. */
  colors?: string[];
  /** Hot colour where threads overlap and converge. */
  coreColor?: string;
  /** Fills the canvas behind the threads. Transparent lets the page show through. */
  backgroundColor?: string;
  /** Draws crisp ink strokes for light backgrounds instead of glowing light. */
  lightMode?: boolean;
  /** Number of threads, up to 24. */
  threadCount?: number;
  /** How fast the threads weave. */
  speed?: number;
  /** How many waves fit across the width. */
  frequency?: number;
  /** How far the threads fan away from the pinch. */
  spread?: number;
  /** How much wider each next thread swings, nesting them inside each other. */
  taper?: number;
  /** Height of the weave, from bottom 0 to top 1. */
  position?: number;
  /** Where the threads converge across the width, 0 to 1. */
  pinch?: number;
  /** Number of pinch points. More than one braids the threads. */
  nodes?: number;
  /** Rotation of the whole weave in degrees. */
  angle?: number;
  /** Strength of the light around each thread. */
  glow?: number;
  /** How quickly the glow fades. Higher is tighter. */
  falloff?: number;
  /** Width of the threads. */
  thickness?: number;
  /** Overall brightness. */
  brightness?: number;
  /** Opacity of the whole effect. */
  opacity?: number;
  /** Twists the threads in 3D so strands behind the bundle thin and dim. */
  depth?: number;
  /** Strength of light pulses travelling along the threads toward the pinch. */
  pulses?: number;
  /** Weaves each side of the pinch as a mirror. */
  mirror?: boolean;
  /** Adds a gentle, uneven sway to each thread. */
  shimmer?: boolean;
  /** Fades the threads out toward both ends so they melt into the page. */
  fade?: number;
  /** Film grain in the light. 0 turns it off. */
  grain?: number;
  /** Draws the threads in one after another the first time they come into view. */
  intro?: boolean;
  /** The strand nearest the cursor lights up while the others recede. */
  mouseInteraction?: boolean;
  /** How strongly the focused strand stands out from the rest. */
  mouseStrength?: number;
  /** Clicking sends light along every thread toward the pinch. */
  pulseOnClick?: boolean;
  /** Freezes the weaving. */
  paused?: boolean;
  /** Maximum device pixel ratio of the canvas. */
  dpr?: number;
  /** Extra class names for the container. */
  className?: string;
  /** Inline styles for the container. */
  style?: CSSProperties;
};

declare const WebThreads: (props: WebThreadsProps) => ReactElement;

export default WebThreads;
