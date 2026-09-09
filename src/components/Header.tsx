import { useState } from 'react';
import type { Route } from '../types';
import { navigate } from '../hooks/useHashRoute';
import { getSoundsEnabled, setSoundsEnabled } from '../lib/sound';

const STEP_OF: Record<Route, number> = {
  welcome: 0,
  settings: 1,
  camera: 2,
  result: 3,
};

const TITLE_OF: Record<Route, string> = {
  welcome: 'Photo Booth',
  settings: 'Pick a look',
  camera: 'Say cheese',
  result: 'Take it home',
};

export function Header({ route }: { route: Route }) {
  const step = STEP_OF[route];
  const [soundEnabled, setSoundEnabledState] = useState(getSoundsEnabled);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundsEnabled(next);
    setSoundEnabledState(next);
  };

  return (
    <header className="header">
      <div className="header__start">
        {route !== 'welcome' && (
          <button
            className="header__home"
            onClick={() => navigate('welcome')}
            aria-label="Start over"
            title="Start over"
          >
            <HomeIcon />
          </button>
        )}
        <button
          className="header__sound"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
          title={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
          aria-pressed={soundEnabled}
        >
          <SoundIcon muted={!soundEnabled} />
        </button>
      </div>

      {route !== 'welcome' && <h1 className="header__title">{TITLE_OF[route]}</h1>}

      <div className="header__steps" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`header__step${step >= n ? ' header__step--on' : ''}`}
            aria-hidden="true"
          >
            {n}
          </span>
        ))}
      </div>
    </header>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M3 7h3l4-3v10l-4-3H3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {muted ? (
        <path d="m12.5 7 3 4m0-4-3 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M12.5 6.5c1.5 1.4 1.5 3.6 0 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2 7.2 8 2l6 5.2V14H10v-4H6v4H2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
