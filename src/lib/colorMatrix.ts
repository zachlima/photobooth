/**
 * The CSS filter shorthands, rebuilt as 4x5 color matrices.
 *
 * Why bother: the live preview uses a CSS `filter` string on the <video>, and
 * the capture has to reproduce it exactly on a canvas. Canvas `ctx.filter`
 * would be the obvious route, but iOS Safari didn't support it until 18 and
 * mobile is the primary target here.
 *
 * These are the matrices from the Filter Effects spec, so composing the same
 * primitives in the same order as the CSS string gives a pixel-identical
 * result. CSS shorthand filters interpolate in sRGB, which is exactly what
 * ImageData holds, so the math runs directly on the raw bytes.
 *
 * Layout: 4 rows of [r, g, b, a, offset]; offset is in 0..1 units.
 */

export type Matrix = number[]; // length 20

function grayscale(amount: number): Matrix {
  const t = 1 - amount;
  return [
    0.2126 + 0.7874 * t, 0.7152 - 0.7152 * t, 0.0722 - 0.0722 * t, 0, 0,
    0.2126 - 0.2126 * t, 0.7152 + 0.2848 * t, 0.0722 - 0.0722 * t, 0, 0,
    0.2126 - 0.2126 * t, 0.7152 - 0.7152 * t, 0.0722 + 0.9278 * t, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function sepia(amount: number): Matrix {
  const t = 1 - amount;
  return [
    0.393 + 0.607 * t, 0.769 - 0.769 * t, 0.189 - 0.189 * t, 0, 0,
    0.349 - 0.349 * t, 0.686 + 0.314 * t, 0.168 - 0.168 * t, 0, 0,
    0.272 - 0.272 * t, 0.534 - 0.534 * t, 0.131 + 0.869 * t, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function saturate(s: number): Matrix {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function hueRotate(deg: number): Matrix {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0, 0,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0, 0,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function brightness(k: number): Matrix {
  return [k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, 1, 0];
}

function contrast(k: number): Matrix {
  const o = 0.5 - 0.5 * k;
  return [k, 0, 0, 0, o, 0, k, 0, 0, o, 0, 0, k, 0, o, 0, 0, 0, 1, 0];
}

/**
 * Each filter as an ordered list of primitives, matching its `css` string in
 * FILTERS (src/types.ts) — same primitives, same order, same arguments.
 *
 * A list rather than one composed matrix, because CSS clamps to 8 bits after
 * *every* primitive. Folding them into a single matrix defers all clamping to
 * the end, which can drift badly on strong, multi-stage filters. Applying one
 * pass per primitive reproduces the browser's clamping exactly.
 */
export const FILTER_STAGES: Record<string, Matrix[]> = {
  none: [],
  bw: [grayscale(1), contrast(1.3)],
  sepia: [sepia(1), brightness(0.66), saturate(1.6), hueRotate(-8), contrast(1.08)],
  kodak: [brightness(0.98), contrast(0.76), saturate(0.64), sepia(0.22), hueRotate(-12)],
  vintage: [sepia(0.7), saturate(0.7), contrast(0.8), brightness(1.16), hueRotate(-10)],
  y2k: [brightness(1.16), contrast(0.9), saturate(0.88), sepia(0.16), hueRotate(34)],
  instagram2016: [sepia(0.32), saturate(1.28), contrast(1.04), brightness(1.1), hueRotate(-14)],
  digicam: [brightness(1.12), contrast(1.28), saturate(0.72), hueRotate(7)],
};
