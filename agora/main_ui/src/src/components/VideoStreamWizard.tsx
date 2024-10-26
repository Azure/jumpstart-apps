import React, { useEffect, useRef } from 'react';

interface VideoStreamProps {
  title: string;
  videoUrl: string;
}

function VideoStreamWizard({ title, videoUrl }: VideoStreamProps) {
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
      <h1>{title}</h1>
      <img 
        ref={imgRef}
        alt="Video stream"
        style={{
          maxWidth: '800px',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0',
          left: '0'
        }}
      />
    </div>
  );
}

// Default props
VideoStreamWizard.defaultProps = {
  title: 'Video Stream',
  videoUrl: 'http://localhost:3001/video_feed'
};

export default VideoStreamWizard;