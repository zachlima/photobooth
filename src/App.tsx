import { useEffect } from 'react';
import { Header } from './components/Header';
import { navigate, useHashRoute } from './hooks/useHashRoute';
import { useViewportHeight } from './hooks/useViewportHeight';
import { useBooth } from './state/BoothContext';
import { Welcome } from './screens/Welcome';
import { Settings } from './screens/Settings';
import { Camera } from './screens/Camera';
import { Result } from './screens/Result';
import { frameById, type FilterId, type FrameId } from './types';

let demoSeeded = false;

export default function App() {
  const route = useHashRoute();
  const { photos, frame, addPhoto, setFilter, setFrame } = useBooth();
  const photoCount = frameById(frame).photoCount;

  useViewportHeight();

  // Dev-only: `?demo` seeds four stand-in photos and jumps to the result, so
  // the strip and its frames can be iterated on without the camera.
  // `?demo&filter=vintage&frame=film` picks a combination to inspect.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('demo')) return;
    // StrictMode double-invokes effects in dev; without this we seed eight.
    if (demoSeeded) return;
    demoSeeded = true;

    const wanted = (params.get('filter') ?? 'none') as FilterId;
    const wantedFrame = (params.get('frame') ?? 'black') as FrameId;
    const finalFilter = frameById(wantedFrame).lockedFilter ?? wanted;
    setFilter(finalFilter);
    setFrame(wantedFrame);

    void import('./dev/demo').then(({ makeDemoPhotos }) => {
      makeDemoPhotos(frameById(wantedFrame).photoCount, finalFilter).forEach(addPhoto);
      navigate('result');
    });
  }, [addPhoto, setFilter, setFrame]);

  // A reloaded or deep-linked #/result has no photos in memory; send those
  // users back to the start rather than showing an empty strip.
  useEffect(() => {
    if (route === 'result' && photos.length < photoCount) {
      navigate('welcome');
    }
  }, [route, photos.length, photoCount]);

  return (
    <div className="app">
      <Header route={route} />
      {route === 'welcome' && <Welcome />}
      {route === 'settings' && <Settings />}
      {route === 'camera' && <Camera />}
      {route === 'result' && photos.length === photoCount && <Result />}
    </div>
  );
}
