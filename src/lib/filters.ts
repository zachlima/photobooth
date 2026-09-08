import { FILTER_STAGES, type Matrix } from './colorMatrix';
import { filterById, type FilterId } from '../types';

export function applyMatrix(data: Uint8ClampedArray, m: Matrix) {
  // Offsets are in 0..1 units; ImageData is 0..255.
  const o0 = m[4] * 255;
  const o1 = m[9] * 255;
  const o2 = m[14] * 255;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Uint8ClampedArray clamps and rounds on assignment, so no manual clamp.
    data[i] = m[0] * r + m[1] * g + m[2] * b + o0;
    data[i + 1] = m[5] * r + m[6] * g + m[7] * b + o1;
    data[i + 2] = m[10] * r + m[11] * g + m[12] * b + o2;
  }
}

/** Keep these two constants in step with the `.vignette` overlay in global.css. */
const VIGNETTE_INNER = 0.3;
const VIGNETTE_MAX_ALPHA = 0.62;

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  if (strength <= 0) return;
  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createRadialGradient(
    cx,
    cy,
    Math.min(w, h) * VIGNETTE_INNER,
    cx,
    cy,
    Math.hypot(cx, cy),
  );
  grad.addColorStop(0, 'rgba(30, 20, 10, 0)');
  grad.addColorStop(1, `rgba(30, 20, 10, ${VIGNETTE_MAX_ALPHA * strength})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Film grain, added in place.
 *
 * The preview shows a static SVG noise texture instead, so the two won't be
 * grain-for-grain identical — noise is random by nature. The character
 * (amount and coarseness) is what has to match, and does.
 */
export function addGrain(data: Uint8ClampedArray, strength: number) {
  if (strength <= 0) return;
  const amount = strength * 46;
  for (let i = 0; i < data.length; i += 4) {
    // One value per pixel, so grain is monochrome rather than colour speckle.
    const n = (Math.random() - 0.5) * amount;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
}

/** Applies a filter's colour, grain and vignette to a canvas, in place. */
export function applyFilter(canvas: HTMLCanvasElement, filter: FilterId) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const opt = filterById(filter);
  const stages = FILTER_STAGES[filter] ?? [];

  if (stages.length || opt.grain) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // One clamped pass per primitive, mirroring how CSS applies them.
    for (const stage of stages) applyMatrix(img.data, stage);
    if (opt.grain) addGrain(img.data, opt.grain);
    ctx.putImageData(img, 0, 0);
  }
  if (opt.vignette) {
    drawVignette(ctx, canvas.width, canvas.height, opt.vignette);
  }
}
