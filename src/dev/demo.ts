/**
 * Development-only stand-in photos.
 *
 * Lets the strip, the frames and the result animation be worked on without
 * granting camera access every reload. Loaded via a dynamic import guarded by
 * import.meta.env.DEV, so it is dropped from production builds.
 */
import { applyFilter } from '../lib/filters';
import type { FilterId } from '../types';

const BACKDROPS = ['#8fbeea', '#f7a8c4', '#ffe071', '#b5dc7a'];

export function makeDemoPhotos(count: number, filter: FilterId = 'none'): HTMLCanvasElement[] {
  return Array.from({ length: count }, (_, i) => {
    const c = document.createElement('canvas');
    c.width = 900;
    c.height = 1200;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;

    ctx.fillStyle = BACKDROPS[i % BACKDROPS.length];
    ctx.fillRect(0, 0, 900, 1200);

    // Something face-shaped and warm, so filters read the way they will on skin.
    ctx.fillStyle = '#7cdba4';
    ctx.beginPath();
    ctx.moveTo(0, 1200);
    ctx.lineTo(320, 670);
    ctx.lineTo(640, 1200);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e8734a';
    ctx.beginPath();
    ctx.ellipse(450, 1030, 250, 230, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f0b98d';
    ctx.beginPath();
    ctx.arc(450, 610, 185, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3526';
    ctx.beginPath();
    ctx.arc(450, 570, 185, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#2b1d13';
    ctx.beginPath();
    ctx.arc(385, 610, 22, 0, Math.PI * 2);
    ctx.arc(515, 610, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2b1d13';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(450, 660, 80, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = 'rgba(26,26,26,0.6)';
    ctx.font = '600 64px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1), 850, 110);

    applyFilter(c, filter);
    return c;
  });
}
