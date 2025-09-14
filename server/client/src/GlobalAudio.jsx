import { useEffect, useRef } from "react";

const GlobalAudio = ({ isLoading }) => {
  const globalRef = useRef(null);
  const loadingRef = useRef(null);
  const maxVolume = 0.5;
  const fadeDuration = 1000; // ms
  const stepTime = 50; // ms
  const steps = fadeDuration / stepTime;

  const fadeOut = (audioRef, onComplete) => {
    if (!audioRef?.current) return;
    let volume = audioRef.current.volume || maxVolume;
    const step = volume / steps;

    const fade = () => {
      if (!audioRef.current) return;
      volume = Math.max(0, volume - step);
      audioRef.current.volume = volume;
      if (volume > 0) {
        setTimeout(fade, stepTime);
      } else {
        audioRef.current.pause();
        if (onComplete) onComplete();
      }
    };

    fade();
  };

  const fadeIn = (audioRef) => {
    if (!audioRef?.current) return;
    audioRef.current.volume = 0;
    audioRef.current.play().catch(() => {});
    let volume = 0;
    const step = maxVolume / steps;

    const fade = () => {
      if (!audioRef.current) return;
      volume = Math.min(maxVolume, volume + step);
      audioRef.current.volume = volume;
      if (volume < maxVolume) {
        setTimeout(fade, stepTime);
      }
    };

    fade();
  };

  useEffect(() => {
    const globalAudio = globalRef.current;
    const loadingAudio = loadingRef.current;

    if (!globalAudio || !loadingAudio) return;

    if (isLoading) {
      fadeOut(globalRef, () => {
        loadingAudio.currentTime = 0;
        fadeIn(loadingRef);
      });
    } else {
      fadeOut(loadingRef, () => {
        globalAudio.currentTime = 0;
        fadeIn(globalRef);
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const playOnClick = () => {
      if (isLoading) {
        loadingRef.current?.play().catch(() => {});
      } else {
        globalRef.current?.play().catch(() => {});
      }
    };
    document.addEventListener("click", playOnClick, { once: true });
    return () => {
      document.removeEventListener("click", playOnClick);
    };
  }, [isLoading]);

  return (
    <>
      <audio ref={globalRef} loop>
        <source src="/audio/full.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={loadingRef} loop>
        <source src="/audio/loading.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
};

export default GlobalAudio;