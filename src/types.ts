export type FilterId =
  | 'none'
  | 'disposable'
  | 'bw'
  | 'sepia'
  | 'bronze'
  | 'vintage'
  | 'y2k'
  | 'instagram2016'
  | 'digicam';
export type FrameId = 'black' | 'white' | 'film' | 'japaneseId' | 'calendar2027' | 'purikura';
export type Route = 'welcome' | 'settings' | 'camera' | 'result';

/**
 * Cell width / height on the strip, and therefore the camera's crop.
 *
 * 3:4 portrait, the classic booth cell. Note this makes the finished strip
 * roughly 1:5, so on a phone it renders fairly narrow — that is inherent to
 * four portrait frames in a column, not a layout bug.
 */
export const CELL_ASPECT = 3 / 4;

export interface FilterOption {
  id: FilterId;
  label: string;
  /** Drives the live preview, and is mirrored as a colour matrix for capture. */
  css: string;
  /** Edge darkening, 0..1. Applied to both the preview and the saved photo. */
  vignette?: number;
  /** Film grain, 0..1. */
  grain?: number;
}

/**
 * Kept deliberately far apart from each other: one greyscale, one warm-brown,
 * one saturated copper, one washed-out fade, one high-contrast flash look.
 * If you edit a `css` string, edit the matching entry in FILTER_MATRIX
 * (src/lib/colorMatrix.ts) to the same primitives in the same order.
 */
export const FILTERS: FilterOption[] = [
  { id: 'none', label: 'None', css: 'none' },
  {
    id: 'disposable',
    label: 'Disposable',
    // Harsh on-camera flash: punchy, slightly green-warm, grainy, dark corners.
    css: 'contrast(1.45) saturate(1.5) brightness(1.08) hue-rotate(-6deg) sepia(0.12)',
    vignette: 0.85,
    grain: 0.55,
  },
  { id: 'bw', label: 'B & W', css: 'grayscale(1) contrast(1.3)' },
  {
    id: 'sepia',
    label: 'Sepia',
    // Brown, not yellow. sepia(1) alone pushes a skin tone to about
    // rgb(255,234,183) — pale cream. The fix is to darken hard *first* and
    // then put the warmth back with saturation; desaturating a bright cream
    // only makes it greyer, never browner.
    css: 'sepia(1) brightness(0.66) saturate(1.6) hue-rotate(-8deg) contrast(1.08)',
  },
  {
    id: 'bronze',
    label: 'Bronze',
    // Warm copper. sepia(1) flattens to brown, then moderate saturation and a
    // push toward red bring back the metal without going neon.
    css: 'sepia(1) brightness(0.88) hue-rotate(-28deg) saturate(2) contrast(1.05)',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    // Faded and dusty: low contrast with lifted blacks, not just a warm tint.
    // Pulled back from contrast(.68)/brightness(1.28), which washed the face
    // out almost entirely. A soft vignette carries the character instead.
    css: 'sepia(0.7) saturate(0.7) contrast(0.8) brightness(1.16) hue-rotate(-10deg)',
    vignette: 0.4,
  },
  {
    id: 'y2k',
    label: 'Y2K',
    css: 'contrast(1.18) saturate(1.65) brightness(1.08) hue-rotate(8deg)',
    grain: 0.22,
  },
  {
    id: 'instagram2016',
    label: '2016 Insta',
    css: 'sepia(0.18) saturate(1.28) contrast(1.08) brightness(1.06) hue-rotate(-8deg)',
    vignette: 0.2,
  },
  {
    id: 'digicam',
    label: 'Digicam',
    css: 'contrast(1.3) saturate(1.12) brightness(1.12) hue-rotate(-4deg)',
    vignette: 0.32,
    grain: 0.34,
  },
];

export interface FrameOption {
  id: FrameId;
  label: string;
  photoCount: number;
  lockedFilter?: FilterId;
}

export const FRAMES: FrameOption[] = [
  { id: 'black', label: 'Black', photoCount: 4 },
  { id: 'white', label: 'White', photoCount: 4 },
  { id: 'film', label: 'Filmstrip', photoCount: 4 },
  { id: 'japaneseId', label: 'Japanese ID', photoCount: 4, lockedFilter: 'none' },
  { id: 'calendar2027', label: '2027 Calendar', photoCount: 12 },
  { id: 'purikura', label: 'Purikura', photoCount: 4 },
];

/** Look up a filter's definition; falls back to "none". */
export function filterById(id: FilterId): FilterOption {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}

export function frameById(id: FrameId): FrameOption {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
