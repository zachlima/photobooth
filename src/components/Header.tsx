import type { Route } from '../types';
import { navigate } from '../hooks/useHashRoute';

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

  return (
    <header className="header">
      {route === 'welcome' ? (
        <span className="header__title">{TITLE_OF[route]}</span>
      ) : (
        <button className="header__home" onClick={() => navigate('welcome')}>
          <HomeIcon />
          Start over
        </button>
      )}

      {route !== 'welcome' && <span className="header__title">{TITLE_OF[route]}</span>}

      <div className="header__steps" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`header__dot${step >= n ? ' header__dot--on' : ''}`} />
        ))}
      </div>
    </header>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
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
