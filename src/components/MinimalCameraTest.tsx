import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { X, RefreshCw } from 'lucide-react';

interface MinimalCameraTestProps {
  onClose: () => void;
}

export function MinimalCameraTest({ onClose }: MinimalCameraTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setStatus('Requesting camera access...');
    
    try {
      // Most basic camera request possible
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('Got media stream:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setStatus('Stream received, setting up video...');

      if (videoRef.current) {
        // Clear any existing content
        videoRef.current.srcObject = null;
        
        // Wait a bit then assign stream
        setTimeout(() => {
          if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            setStatus('Video source set, waiting for load...');
            
            // Force play
            videoRef.current.play().then(() => {
              setStatus('Video playing successfully!');
            }).catch((playError) => {
              console.error('Play error:', playError);
              setStatus(`Play error: ${playError.message}`);
            });
          }
        }, 100);
      }

    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Camera error: ${err.name} - ${err.message}`);
      setStatus('Failed to access camera');
    }
  };

  const restartCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTimeout(startCamera, 500);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Status Bar */}
      <div className="bg-gray-800 text-white p-2 text-sm">
        Status: {status}
        {error && <div className="text-red-400 mt-1">Error: {error}</div>}
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full"
          style={{
            backgroundColor: '#333',
            objectFit: 'cover'
          }}
          playsInline
          muted
          autoPlay
          onLoadedMetadata={() => {
            console.log('Video metadata loaded');
            setStatus('Video metadata loaded');
          }}
          onLoadedData={() => {
            console.log('Video data loaded');
            setStatus('Video data loaded');
          }}
          onCanPlay={() => {
            console.log('Video can play');
            setStatus('Video can play');
          }}
          onPlay={() => {
            console.log('Video started playing');
            setStatus('Video is playing!');
          }}
          onError={(e) => {
            console.error('Video element error:', e);
            setStatus('Video element error');
          }}
          onTimeUpdate={() => {
            // This fires when video is actually playing
            if (videoRef.current) {
              const video = videoRef.current;
              setStatus(`Playing: ${video.videoWidth}x${video.videoHeight} at ${video.currentTime.toFixed(1)}s`);
            }
          }}
        />

        {/* Debug Info */}
        <div className="absolute bottom-16 left-4 bg-black/70 text-white p-2 text-xs rounded">
          <div>Video Element Ready: {videoRef.current ? 'Yes' : 'No'}</div>
          <div>Stream: {stream ? 'Active' : 'None'}</div>
          <div>Video Tracks: {stream?.getVideoTracks().length || 0}</div>
          {videoRef.current && (
            <>
              <div>Video Size: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
              <div>Current Time: {videoRef.current.currentTime.toFixed(2)}s</div>
              <div>Paused: {videoRef.current.paused ? 'Yes' : 'No'}</div>
              <div>Muted: {videoRef.current.muted ? 'Yes' : 'No'}</div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
        
        <Button variant="outline" onClick={restartCamera}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart Camera
        </Button>
      </div>
    </div>
  );
}