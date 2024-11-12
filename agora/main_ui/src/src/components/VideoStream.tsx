import React, { useEffect, useRef } from 'react';

interface VideoStreamProps {
  title: string;
  videoUrl: string;
}

function VideoStream({ title, videoUrl }: VideoStreamProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  return (
    <div className="video-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%'
    }}>
      <img 
        ref={imgRef}
        alt="Video stream"
        style={{
          maxWidth: '800px',
          width: '100%',
        }}
      />
    </div>
  );
}

// Default props
VideoStream.defaultProps = {
  title: 'Video Stream',
  videoUrl: 'http://localhost:3001/video_feed'
};

export default VideoStream;