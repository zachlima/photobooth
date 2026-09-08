import { useEffect, useState } from 'react';
import type { Route } from '../types';

const ROUTES: readonly string[] = ['welcome', 'settings', 'camera', 'result'];

function readHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return (ROUTES.includes(raw) ? raw : 'welcome') as Route;
}

/** Hash routing keeps the browser back button working with no router dependency. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readHash);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/welcome');
    }
    const onChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(route: Route) {
  window.location.hash = `#/${route}`;
}
