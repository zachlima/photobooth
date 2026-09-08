import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'starting' | 'ready' | 'denied' | 'missing' | 'insecure' | 'error';

export interface CameraState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  retry: () => void;
}

/**
 * Opens the front camera and binds it to a <video>.
 *
 * The video element must carry playsInline + muted + autoPlay or iOS Safari
 * refuses to start the stream, and the tracks have to be stopped explicitly on
 * unmount or the camera indicator stays lit after the user leaves the screen.
 */
export function useCamera(): CameraState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('starting');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus('starting');
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // getUserMedia is gated on a secure context; localhost counts, plain http
    // over a LAN address does not, which is the usual cause of a silent failure
    // when testing from a phone.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus(window.isSecureContext ? 'missing' : 'insecure');
      return;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });

        // StrictMode runs effects twice in dev; if we were torn down while
        // awaiting, drop the stream rather than leaking a live camera.
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          try {
            await video.play();
          } catch {
            // Autoplay rejection still leaves a usable element on most
            // browsers; the shutter press will nudge it.
          }
        }
        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : '';
        if (name === 'NotAllowedError' || name === 'SecurityError') setStatus('denied');
        else if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('missing');
        else setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [attempt]);

  return { videoRef, status, retry };
}
