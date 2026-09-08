import { useEffect } from 'react';

/**
 * Publishes the real viewport height as `--app-h`.
 *
 * `100dvh` on its own is not reliable across a mobile tab restore: closing and
 * reopening Chrome on iOS could lay the app out against a stale viewport, so
 * the whole page rendered oversized and overflowed until something forced a
 * resize (which is why minimising and reopening "fixed" it).
 *
 * visualViewport is the most accurate source where it exists; innerHeight is
 * the fallback. `pageshow` covers the back/forward cache restore and
 * `visibilitychange` covers a tab being resumed, which are exactly the paths
 * that produced the bug.
 */
export function useViewportHeight() {
  useEffect(() => {
    let frame = 0;

    const apply = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      if (h > 0) document.documentElement.style.setProperty('--app-h', `${Math.round(h)}px`);
    };

    // A restored tab often reports the old size for a frame or two, so
    // re-measure on the next frame as well as immediately.
    const sync = () => {
      apply();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    sync();

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', onVisible);
    window.visualViewport?.addEventListener('resize', sync);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', onVisible);
      window.visualViewport?.removeEventListener('resize', sync);
    };
  }, []);
}
