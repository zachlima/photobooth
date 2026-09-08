import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { filterForFrame, type FilterId, type FrameId } from '../types';

/** A captured shot: already filtered and cropped, ready to draw onto the strip. */
export type Photo = HTMLCanvasElement;

interface BoothState {
  filter: FilterId;
  frame: FrameId;
  photos: Photo[];
  stripDataUrl: string | null;
  setFilter: (f: FilterId) => void;
  setFrame: (f: FrameId) => void;
  addPhoto: (p: Photo) => void;
  setStripDataUrl: (url: string | null) => void;
  resetSession: () => void;
}

const BoothCtx = createContext<BoothState | null>(null);

export function BoothProvider({ children }: { children: ReactNode }) {
  const [filter, setFilterState] = useState<FilterId>('none');
  const [frame, setFrameState] = useState<FrameId>('black');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stripDataUrl, setStripDataUrl] = useState<string | null>(null);

  const addPhoto = useCallback((p: Photo) => setPhotos((prev) => [...prev, p]), []);

  const setFilter = useCallback(
    (next: FilterId) => {
      setFilterState(filterForFrame(frame, next));
    },
    [frame],
  );

  const setFrame = useCallback((next: FrameId) => {
    setFrameState(next);
    setFilterState((current) => filterForFrame(next, current));
  }, []);

  /** Clears the shots but keeps the chosen look, so "start over" is one tap. */
  const resetSession = useCallback(() => {
    setPhotos([]);
    setStripDataUrl(null);
  }, []);

  const value = useMemo(
    () => ({
      filter,
      frame,
      photos,
      stripDataUrl,
      setFilter,
      setFrame,
      addPhoto,
      setStripDataUrl,
      resetSession,
    }),
    [filter, frame, photos, stripDataUrl, setFilter, setFrame, addPhoto, resetSession],
  );

  return <BoothCtx.Provider value={value}>{children}</BoothCtx.Provider>;
}

export function useBooth(): BoothState {
  const ctx = useContext(BoothCtx);
  if (!ctx) throw new Error('useBooth must be used inside <BoothProvider>');
  return ctx;
}
