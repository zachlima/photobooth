import { useCallback, useEffect, useRef, useState } from 'react';
import { FilterOverlays } from '../components/FilterOverlays';
import { useCamera } from '../hooks/useCamera';
import { navigate } from '../hooks/useHashRoute';
import { capturePhoto } from '../lib/capture';
import { useBooth } from '../state/BoothContext';
import { CELL_ASPECT, filterCssForPreview, frameById } from '../types';
import './camera.css';

const COUNTDOWN_FROM = 3;
const FLASH_MS = 140;
const BETWEEN_SHOTS_MS = 900;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_LABELS = MONTH_NAMES.map((month) => month.slice(0, 3).toUpperCase());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Camera() {
  const { videoRef, status, retry } = useCamera();
  const { filter, frame, photos, addPhoto, resetSession } = useBooth();

  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [running, setRunning] = useState(false);
  const abort = useRef(false);

  const filterCss = filterCssForPreview(filter);
  const photoCount = frameById(frame).photoCount;

  // Arriving at the booth always starts a fresh strip, so a second run after
  // "start over" doesn't append to the previous four shots.
  useEffect(() => {
    resetSession();
    abort.current = false;
    return () => {
      abort.current = true;
    };
  }, [resetSession]);

  const run = useCallback(async () => {
    const video = videoRef.current;
    if (!video || running) return;
    setRunning(true);

    for (let shot = 0; shot < photoCount; shot++) {
      for (let c = COUNTDOWN_FROM; c > 0; c--) {
        if (abort.current) return;
        setCount(c);
        await sleep(1000);
      }
      if (abort.current) return;

      setCount(0);
      setFlash(true);
      await sleep(FLASH_MS);

      const photo = capturePhoto(video, filter);
      if (abort.current) return;
      addPhoto(photo);
      setFlash(false);

      if (shot < photoCount - 1) await sleep(BETWEEN_SHOTS_MS);
    }

    // Beat before leaving, so the fourth thumbnail is seen landing.
    await sleep(600);
    if (!abort.current) navigate('result');
  }, [videoRef, running, filter, photoCount, addPhoto]);

  if (status !== 'ready' && status !== 'starting') {
    return <CameraProblem status={status} onRetry={retry} />;
  }

  return (
    <main className="screen camera">
      <div
        className="camera__stage"
        style={{ '--cell-aspect': String(CELL_ASPECT) } as React.CSSProperties}
      >
        <div className="preview">
          <video
            ref={videoRef}
            className="preview__video"
            style={{ filter: filterCss }}
            playsInline
            muted
            autoPlay
          />
          <FilterOverlays filter={filter} />

          {status === 'starting' && <p className="preview__msg">Waking the camera…</p>}

          {count > 0 && (
            <div className="countdown" key={count}>
              <span className="countdown__num">{count}</span>
            </div>
          )}
          {!running && status === 'ready' && (
            <p className="preview__hint">
              {photoCount} photos · 3-second countdown
            </p>
          )}
          {running && frame === 'calendar2027' && (
            <p className="preview__month" aria-live="polite">
              {MONTH_NAMES[Math.min(photos.length, 11)]} 2027
            </p>
          )}
          <div className={`flash${flash ? ' flash--on' : ''}`} />
        </div>

        <ol
          className={`slots${photoCount > 6 ? ' slots--many' : ''}`}
          aria-label={`${photos.length} of ${photoCount} photos taken`}
        >
          {Array.from({ length: photoCount }, (_, i) => (
            <li
              key={i}
              className={`slot${photos[i] ? ' slot--filled' : ''}`}
              style={{ aspectRatio: String(CELL_ASPECT) }}
            >
              {photos[i] ? (
                <Thumb canvas={photos[i]} />
              ) : (
                <span className="slot__num">{frame === 'calendar2027' ? MONTH_LABELS[i] : i + 1}</span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="screen__controls">
        <button
          className="btn btn--primary btn--wide shutter"
          onClick={run}
          disabled={running || status !== 'ready'}
        >
          {running ? `Photo ${Math.min(photos.length + 1, photoCount)} of ${photoCount}` : 'Start'}
        </button>
      </div>
    </main>
  );
}

/**
 * Draws a captured canvas into a thumbnail.
 *
 * The bitmap must carry CELL_ASPECT: a square thumbnail canvas squashed the
 * photo on the way in and then got stretched again by the slot's own aspect
 * ratio, which is what made the strip preview look vertically distorted.
 */
const THUMB_W = 132;
const THUMB_H = Math.round(THUMB_W / CELL_ASPECT);

function Thumb({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.getContext('2d')!.drawImage(canvas, 0, 0, el.width, el.height);
  }, [canvas]);
  return <canvas ref={ref} width={THUMB_W} height={THUMB_H} className="slot__img" />;
}

const PROBLEM_COPY: Record<string, { title: string; body: string; canRetry: boolean }> = {
  denied: {
    title: 'Camera blocked',
    body: 'Allow camera access for this site in your browser settings, then try again.',
    canRetry: true,
  },
  missing: {
    title: 'No camera found',
    body: 'This device does not seem to have a camera we can use.',
    canRetry: true,
  },
  insecure: {
    title: 'Needs a secure connection',
    body: 'Browsers only allow the camera over https. Open this page on its https address.',
    canRetry: false,
  },
  error: {
    title: 'Camera would not start',
    body: 'Something went wrong opening the camera. Try again, or reload the page.',
    canRetry: true,
  },
};

function CameraProblem({ status, onRetry }: { status: string; onRetry: () => void }) {
  const copy = PROBLEM_COPY[status] ?? PROBLEM_COPY.error;
  return (
    <main className="screen">
      <div className="screen__body">
        <div className="problem">
          <h2 className="problem__title">{copy.title}</h2>
          <p className="note">{copy.body}</p>
        </div>
      </div>
      <div className="screen__controls">
        {copy.canRetry && (
          <button className="btn btn--primary" onClick={onRetry}>
            Try again
          </button>
        )}
        <button className="btn btn--ghost" onClick={() => navigate('settings')}>
          Back
        </button>
      </div>
    </main>
  );
}
