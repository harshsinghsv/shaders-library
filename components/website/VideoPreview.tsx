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
    if (video) {
      video.muted = true;
      video.load(); // Force reload when src changes
      video.play().catch((error) => {
        console.error('Video preview autoplay failed:', error);
      });
    }
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
