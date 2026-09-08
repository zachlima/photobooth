export type FilterId =
  | 'none'
  | 'bw'
  | 'sepia'
  | 'kodak'
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
  /** Intentional detail loss, 0..1, for soft low-resolution camera looks. */
  softness?: number;
  /** A colour wash shared by the live preview and the saved capture. */
  overlay?: {
    color: string;
    opacity: number;
    blendMode: 'screen' | 'soft-light' | 'multiply';
  };
}

/**
 * Kept deliberately far apart from each other: one greyscale, one warm-brown,
 * one dim consumer-film scan, one washed-out fade, one compact-camera look.
 * If you edit a `css` string, edit the matching entry in FILTER_STAGES
 * (src/lib/colorMatrix.ts) to the same primitives in the same order.
 */
export const FILTERS: FilterOption[] = [
  { id: 'none', label: 'None', css: 'none' },
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
    id: 'kodak',
    label: 'Kodak',
    // A dim, hazy consumer-film scan: cool grey-green shadows, restrained
    // colour, warm skin, soft corners and a clearly visible grain structure.
    css: 'brightness(0.98) contrast(0.76) saturate(0.64) sepia(0.22) hue-rotate(-12deg)',
    vignette: 0.44,
    grain: 1,
    softness: 1,
    overlay: { color: '#71848e', opacity: 0.22, blendMode: 'soft-light' },
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
    css: 'brightness(1.16) contrast(0.9) saturate(0.88) sepia(0.16) hue-rotate(34deg)',
    vignette: 0.28,
    grain: 0.38,
    overlay: { color: '#cfffaa', opacity: 0.2, blendMode: 'screen' },
  },
  {
    id: 'instagram2016',
    label: '2016 Insta',
    css: 'sepia(0.32) saturate(1.28) contrast(1.04) brightness(1.1) hue-rotate(-14deg)',
    vignette: 0.25,
    grain: 0.12,
    overlay: { color: '#ef9eb6', opacity: 0.28, blendMode: 'soft-light' },
  },
  {
    id: 'digicam',
    label: 'Digicam',
    css: 'brightness(1.12) contrast(1.28) saturate(0.72) hue-rotate(7deg)',
    vignette: 0.52,
    grain: 0.28,
    overlay: { color: '#dce9cf', opacity: 0.14, blendMode: 'soft-light' },
  },
];

export interface FrameOption {
  id: FrameId;
  label: string;
  photoCount: number;
  /** Omitted means every filter is available for this frame. */
  allowedFilters?: readonly FilterId[];
  /** Selected when the current filter is not allowed after changing frames. */
  preferredFilter?: FilterId;
}

export const FRAMES: FrameOption[] = [
  { id: 'black', label: 'Black', photoCount: 4 },
  { id: 'white', label: 'White', photoCount: 4 },
  { id: 'film', label: 'Filmstrip', photoCount: 4 },
  {
    id: 'japaneseId',
    label: 'Japanese ID',
    photoCount: 4,
    allowedFilters: ['none'],
    preferredFilter: 'none',
  },
  { id: 'calendar2027', label: '2027 Calendar', photoCount: 12 },
  {
    id: 'purikura',
    label: 'Purikura',
    photoCount: 4,
    allowedFilters: ['none'],
    preferredFilter: 'none',
  },
];

/** Look up a filter's definition; falls back to "none". */
export function filterById(id: FilterId): FilterOption {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}

/** CSS approximation of colour and softness for video and settings previews. */
export function filterCssForPreview(id: FilterId): string {
  const option = filterById(id);
  const softness = option.softness ? ` blur(${(option.softness * 1.35).toFixed(2)}px)` : '';
  return `${option.css}${softness}`;
}

export function frameById(id: FrameId): FrameOption {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

/** Keep a requested filter legal for a frame, choosing its natural default if needed. */
export function filterForFrame(frame: FrameId, requested: FilterId): FilterId {
  const option = frameById(frame);
  if (!option.allowedFilters || option.allowedFilters.includes(requested)) return requested;
  return option.preferredFilter ?? option.allowedFilters[0] ?? 'none';
}
