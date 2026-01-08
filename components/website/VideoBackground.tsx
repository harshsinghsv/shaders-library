'use client';
import React, { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  src: string;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ src, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is muted for autoplay
    video.muted = true;

    const playVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
      } catch (error) {
        // Silently handle autoplay failures
        console.log('Autoplay prevented, user interaction required');
      }
    };

    // Play when video can start playing
    const handleCanPlay = () => {
      playVideo();
    };

    // Re-play when video becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playVideo();
      }
    };

    // Handle intersection for when video scrolls into view
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
    observer.observe(video);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Try to play immediately if already ready
    if (video.readyState >= 3) {
      playVideo();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src]);

  return (
    <video
      key={src}
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
    />
  );
};

export default VideoBackground;
