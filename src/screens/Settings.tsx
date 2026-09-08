import { FrameSwatch, SampleScene } from '../art/Swatch';
import { FilterOverlays } from '../components/FilterOverlays';
import { navigate } from '../hooks/useHashRoute';
import { useBooth } from '../state/BoothContext';
import { FILTERS, FRAMES, frameById } from '../types';
import './settings.css';

export function Settings() {
  const { filter, frame, setFilter, setFrame } = useBooth();
  const lockedFilter = frameById(frame).lockedFilter;

  return (
    <main className="screen">
      <div className="screen__body settings__body">
        <section className="settings__group">
          <h2 className="section-label">Filter</h2>
          <div className="swatches swatches--filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`swatch${filter === f.id ? ' swatch--on' : ''}${
                  lockedFilter && lockedFilter !== f.id ? ' swatch--disabled' : ''
                }`}
                aria-pressed={filter === f.id}
                disabled={Boolean(lockedFilter && lockedFilter !== f.id)}
                onClick={() => setFilter(f.id)}
              >
                <span className="swatch__frame">
                  <span className="swatch__clip" style={{ filter: f.css }}>
                    <SampleScene />
                  </span>
                  <FilterOverlays filter={f.id} />
                </span>
                <span className="swatch__label">{f.label}</span>
              </button>
            ))}
          </div>
          {lockedFilter && (
            <p className="settings__note">Japanese ID keeps colors clean and unfiltered.</p>
          )}
        </section>

        <section className="settings__group">
          <h2 className="section-label">Frame</h2>
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
