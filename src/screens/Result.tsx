import { useEffect, useState } from 'react';
import { navigate } from '../hooks/useHashRoute';
import { renderStrip, stripAspect } from '../lib/strip';
import { canShareStrip, downloadStrip, shareStrip } from '../lib/save';
import { useBooth } from '../state/BoothContext';
import './result.css';

const DEVELOPING_MS = 6000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function Result() {
  const { photos, frame, stripDataUrl, setStripDataUrl, resetSession } = useBooth();
  const [toast, setToast] = useState<string | null>(null);
  const [developingDots, setDevelopingDots] = useState(1);

  const aspect = stripAspect(frame, photos.length);
  const touchFirst = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    let cancelled = false;
    Promise.all([renderStrip(photos, frame), sleep(DEVELOPING_MS)]).then(([url]) => {
      if (!cancelled) setStripDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [photos, frame, setStripDataUrl]);

  useEffect(() => {
    if (stripDataUrl) return;
    const timer = window.setInterval(() => {
      setDevelopingDots((dots) => (dots % 3) + 1);
    }, 600);
    return () => window.clearInterval(timer);
  }, [stripDataUrl]);

  const save = async () => {
    if (!stripDataUrl) return;
    const result = await shareStrip(stripDataUrl);
    if (result === 'shared' || result === 'cancelled') return;
    downloadStrip(stripDataUrl);
    setToast('Saved to your downloads');
    setTimeout(() => setToast(null), 2600);
  };

  const again = () => {
    resetSession();
    navigate('camera');
  };

  return (
    <main className="screen result">
      <div className="screen__body result__body">
        {/* --strip-aspect drives a width computed against the viewport. The
            window used to take its width from the image and its height from
            aspect-ratio, which is circular — Safari resolved it to zero and
            the strip never appeared. */}
        <div className="dispenser">
          <div
            className="dispenser__inner"
            style={{ '--strip-aspect': String(aspect) } as React.CSSProperties}
          >
            <div className="dispenser__slot" aria-hidden="true" />
            <div className="dispenser__window">
              {stripDataUrl ? (
                <img
                  className="strip"
                  src={stripDataUrl}
                  alt="Your finished photo print. Press and hold to save it."
                />
              ) : (
                <p className="note dispenser__waiting" aria-live="polite">
                  developing{' .'.repeat(developingDots)}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="note">
          {touchFirst ? 'Press and hold the strip to save it' : 'Right-click the strip to save it'}
          {' · or use the button below'}
        </p>
      </div>

      <div className="screen__controls">
        <button className="btn btn--primary" onClick={save} disabled={!stripDataUrl}>
          {canShareStrip() ? 'Save' : 'Download'}
        </button>
        <button className="btn btn--ghost" onClick={again}>
          Again
        </button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
