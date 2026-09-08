/** Turns the strip's data URL into a File, for the Web Share sheet. */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(header)?.[1] ?? 'image/png';
  const bytes = atob(b64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new File([buf], filename, { type: mime });
}

/** Matches the JPEG produced by renderStrip; the extension must agree with the
 *  data URL's mime or iOS labels the share sheet item wrongly. */
export function stripFilename(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `photobooth-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(
    date.getHours(),
  )}${p(date.getMinutes())}.jpg`;
}

export function canShareStrip(): boolean {
  if (typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') {
    return false;
  }
  try {
    // Probe with a real File — some browsers expose share() but refuse files.
    const probe = new File([new Uint8Array([0])], 'probe.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export type SaveResult = 'shared' | 'cancelled' | 'unsupported' | 'failed';

/**
 * Web Share is the most reliable route into the iOS photo library — an
 * <a download> is inconsistent there, and the long-press menu depends on the
 * user knowing to try it.
 */
export async function shareStrip(dataUrl: string): Promise<SaveResult> {
  if (!canShareStrip()) return 'unsupported';
  try {
    const file = dataUrlToFile(dataUrl, stripFilename());
    await navigator.share({ files: [file], title: 'Photo Booth' });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

export function downloadStrip(dataUrl: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = stripFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
}
