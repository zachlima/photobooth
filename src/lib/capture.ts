import { applyFilter } from './filters';
import { CELL_ASPECT, type FilterId } from '../types';

/** Long edge of a stored photo. Comfortably above what the strip needs. */
const PHOTO_WIDTH = 900;
const PHOTO_HEIGHT = Math.round(PHOTO_WIDTH / CELL_ASPECT);

/**
 * Centre-crops the current video frame to the strip's 3:4 cell and mirrors it.
 *
 * Mirroring matters: the preview is mirrored so the user can frame themselves
 * the way a mirror behaves, and a saved photo that doesn't match what they were
 * looking at reads as a bug.
 */
export function grabFrame(
  video: HTMLVideoElement,
  outW = PHOTO_WIDTH,
  outH = PHOTO_HEIGHT,
): HTMLCanvasElement {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  const target = outW / outH;
  let sw = vw;
  let sh = vh;
  if (vw / vh > target) {
    sw = vh * target;
  } else {
    sh = vw / target;
  }
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.save();
  ctx.translate(outW, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  ctx.restore();
  return canvas;
}

/** One finished, filtered photo ready to go on the strip. */
export function capturePhoto(video: HTMLVideoElement, filter: FilterId): HTMLCanvasElement {
  const canvas = grabFrame(video);
  applyFilter(canvas, filter);
  return canvas;
}
