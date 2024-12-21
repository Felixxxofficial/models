import { useState, useEffect } from 'react';

interface VideoProps {
  src: string;
  title?: string;
  isReel?: boolean;
}

export function Video({ src, title = "Video player", isReel = false }: VideoProps) {
  return (
    <div 
      className="relative mx-auto overflow-hidden rounded-lg"
      style={{ 
        width: isReel ? '320px' : '100%',
        height: isReel ? '568px' : '320px'
      }}
    >
      <iframe
        src={src}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
      />
    </div>
  );
} 