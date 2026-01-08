'use client';
import { useRef, useEffect, useState } from 'react';

interface VideoPreviewProps {
  src: string;
  className?: string;
}

function VideoPreview({ src, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset error state when src changes
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is muted for autoplay
    video.muted = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
          setHasError(false);
        }
      } catch (error) {
        console.log('Autoplay prevented, user interaction required');
      }
    };

    const handleCanPlay = () => {
      setHasError(false);
      playVideo();
    };

    const handleLoadedData = () => {
      setHasError(false);
      playVideo();
    };

    const handleError = () => {
      console.error('Video failed to load:', src);
      if (retryCount < 2) {
        setTimeout(() => {
          if (video) {
            setRetryCount(prev => prev + 1);
            video.load();
          }
        }, 1000);
      } else {
        setHasError(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          }
        });
      },
      { threshold: 0.1 }
    );

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    video.load();

    if (video.readyState >= 3) {
      playVideo();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src, retryCount]);

  const handleRetry = () => {
    setHasError(false);
    setRetryCount(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-white/70 text-sm mb-2">Video failed to load</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : null}
      <video
        key={src}
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover ${hasError ? 'hidden' : ''}`}
      />
    </div>
  );
}

export default VideoPreview;

