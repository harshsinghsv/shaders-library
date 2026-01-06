'use client';
import { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  src: string;
  className?: string;
}

function VideoPreview({ src, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const playVideo = () => {
      if (video.paused) {
        video.play().catch(() => {
          // Silently handle autoplay failures
        });
      }
    };

    // Initial play
    video.load();
    playVideo();

    // Re-play when video becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    // Handle intersection for lazy loading videos
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

    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export default VideoPreview;
