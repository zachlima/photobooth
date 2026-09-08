import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { FrameSwatch, SampleScene } from '../art/Swatch';
import { FilterOverlays } from '../components/FilterOverlays';
import { useCamera } from '../hooks/useCamera';
import { navigate } from '../hooks/useHashRoute';
import { useBooth } from '../state/BoothContext';
import { FILTERS, FRAMES, filterCssForPreview, frameById } from '../types';
import './settings.css';

export function Settings() {
  const { videoRef, status, retry } = useCamera();
  const { filter, frame, setFilter, setFrame } = useBooth();
  const allowedFilters = frameById(frame).allowedFilters;
  const cameraUnavailable = status !== 'starting' && status !== 'ready';

  return (
    <main className="screen">
      <div className="screen__body settings__body">
        <section className="settings-preview" aria-label="Live filter preview">
          <video
            ref={videoRef}
            className="settings-preview__video"
            style={{ filter: filterCssForPreview(filter) }}
            playsInline
            muted
            autoPlay
          />
          <FilterOverlays filter={filter} />

          {status === 'starting' && (
            <p className="settings-preview__status">Waking the camera…</p>
          )}
          {cameraUnavailable && (
            <div className="settings-preview__fallback">
              <p>Camera preview unavailable</p>
              {status !== 'insecure' && status !== 'missing' && (
                <button type="button" onClick={retry}>Try again</button>
              )}
            </div>
          )}
        </section>

        <section className="settings__group">
          <h2 className="section-label">Filter</h2>
          <ScrollRail label="filters">
            <div className="swatches swatches--filters">
              {FILTERS.map((f) => {
                const disabled = Boolean(allowedFilters && !allowedFilters.includes(f.id));
                return (
                  <button
                    key={f.id}
                    className={`swatch${filter === f.id ? ' swatch--on' : ''}${
                      disabled ? ' swatch--disabled' : ''
                    }`}
                    aria-pressed={filter === f.id}
                    disabled={disabled}
                    onClick={() => setFilter(f.id)}
                  >
                    <span className="swatch__frame">
                      <span className="swatch__clip" style={{ filter: filterCssForPreview(f.id) }}>
                        <SampleScene />
                      </span>
                      <FilterOverlays filter={f.id} />
                    </span>
                    <span className="swatch__label">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollRail>
          <p
            className={`settings__note${allowedFilters ? '' : ' settings__note--hidden'}`}
            aria-hidden={!allowedFilters}
          >
            {frame === 'purikura'
              ? 'Purikura frames keep the photo clean and unfiltered.'
              : 'Japanese ID keeps colors clean and unfiltered.'}
          </p>
        </section>

        <section className="settings__group">
          <h2 className="section-label">Frame</h2>
          <ScrollRail label="frames">
            <div className="swatches swatches--frames">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  className={`swatch${frame === f.id ? ' swatch--on' : ''}`}
                  aria-pressed={frame === f.id}
                  onClick={() => setFrame(f.id)}
                >
                  <span
                    className={`swatch__frame swatch__frame--strip${
                      f.id === 'japaneseId' || f.id === 'calendar2027' || f.id === 'purikura'
                        ? ' swatch__frame--print'
                        : ''
                    }`}
                  >
                    <FrameSwatch frame={f.id} />
                  </span>
                  <span className="swatch__label">{f.label}</span>
                </button>
              ))}
            </div>
          </ScrollRail>
        </section>
      </div>

      <div className="screen__controls">
        <button className="btn btn--primary btn--wide" onClick={() => navigate('camera')}>
          To the booth
        </button>
      </div>
    </main>
  );
}

function ScrollRail({ label, children }: { label: string; children: ReactNode }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const overflow = rail.scrollWidth > rail.clientWidth + 2;
    setOverflowing(overflow);
    setCanScrollLeft(overflow && rail.scrollLeft > 2);
    setCanScrollRight(
      overflow && rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2,
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    if (rail.firstElementChild) observer.observe(rail.firstElementChild);
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rail.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const items = Array.from(rail.querySelectorAll<HTMLButtonElement>('.swatch'));
    if (!items.length) return;

    const railRect = rail.getBoundingClientRect();
    const visibleCount = Math.max(
      1,
      items.filter((item) => {
        const rect = item.getBoundingClientRect();
        return rect.left >= railRect.left - 1 && rect.right <= railRect.right + 1;
      }).length,
    );
    const currentIndex = items.reduce((closest, item, index) => {
      const distance = Math.abs(item.getBoundingClientRect().left - railRect.left);
      const closestDistance = Math.abs(
        items[closest].getBoundingClientRect().left - railRect.left,
      );
      return distance < closestDistance ? index : closest;
    }, 0);
    const lastStart = Math.max(0, items.length - visibleCount);
    const targetIndex = direction > 0
      ? Math.min(currentIndex + visibleCount, lastStart)
      : Math.max(currentIndex - visibleCount, 0);
    const targetRect = items[targetIndex].getBoundingClientRect();

    rail.scrollTo({
      left: rail.scrollLeft + targetRect.left - railRect.left,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`scroll-rail${overflowing ? ' scroll-rail--overflowing' : ''}`}>
      <button
        type="button"
        className="scroll-rail__arrow scroll-rail__arrow--left"
        aria-label={`Scroll ${label} left`}
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
      >
        ‹
      </button>
      <div ref={railRef} className="scroll-rail__viewport">
        {children}
      </div>
      <button
        type="button"
        className="scroll-rail__arrow scroll-rail__arrow--right"
        aria-label={`Scroll ${label} right`}
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
      >
        ›
      </button>
    </div>
  );
}
