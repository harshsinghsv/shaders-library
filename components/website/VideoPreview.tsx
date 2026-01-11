'use client';
import { useRef, useEffect, useState, memo } from 'react';

interface VideoPreviewProps {
  src: string;
  className?: string;
}

const VideoPreview = memo(function VideoPreview({ src, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted for autoplay to work
    video.muted = true;

    const tryPlay = async () => {
      try {
        await video.play();
        setShowPlayButton(false);
      } catch (e) {
        setShowPlayButton(true);
      }
    };

    const handleLoaded = () => {
      setIsLoaded(true);
      tryPlay();
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('canplaythrough', tryPlay);

    // Also try immediately if already loaded
    if (video.readyState >= 2) {
      setIsLoaded(true);
      tryPlay();
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('canplaythrough', tryPlay);
    };
  }, [src]);

  const handleVideoClick = async (e: React.MouseEvent) => {
    // Stop propagation so parent card click doesn't trigger
    e.stopPropagation();

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      try {
        if (video.paused) {
          await video.play();
          setShowPlayButton(false);
        } else {
          video.pause();
          setShowPlayButton(true);
        }
      } catch (e) {
        console.log('Click play failed');
      }
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br from-gray-900 to-black ${className}`}
      onClick={handleVideoClick}
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Play button overlay */}
      {showPlayButton && isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="w-14 h-14 rounded-full bg-blue-500/80 flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onPlay={() => setShowPlayButton(false)}
        onPause={() => setShowPlayButton(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
});

export default VideoPreview;
