import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

interface BasicVideoTestProps {
  onClose: () => void;
}

export function BasicVideoTest({ onClose }: BasicVideoTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    startCamera();
    return cleanup;
  }, []);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        addLog(`Stopped track: ${track.kind}`);
      });
    }
  };

  const startCamera = async () => {
    try {
      addLog('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      
      addLog(`Got stream with ${mediaStream.getVideoTracks().length} video tracks`);
      setStream(mediaStream);

      if (videoRef.current) {
        addLog('Setting video srcObject...');
        videoRef.current.srcObject = mediaStream;
        
        addLog('Attempting to play video...');
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              addLog('Video play() succeeded!');
            })
            .catch(error => {
              addLog(`Video play() failed: ${error.message}`);
            });
        }
      }
    } catch (error: any) {
      addLog(`Camera error: ${error.name} - ${error.message}`);
    }
  };

  const forceRestart = () => {
    addLog('Force restarting...');
    cleanup();
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTimeout(startCamera, 1000);
  };

  const testVideoElement = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      addLog(`Video element state:`);
      addLog(`- Dimensions: ${video.videoWidth}x${video.videoHeight}`);
      addLog(`- Current time: ${video.currentTime}`);
      addLog(`- Duration: ${video.duration}`);
      addLog(`- Paused: ${video.paused}`);
      addLog(`- Muted: ${video.muted}`);
      addLog(`- Ready state: ${video.readyState}`);
      addLog(`- Network state: ${video.networkState}`);
      addLog(`- Has srcObject: ${!!video.srcObject}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'white',
      zIndex: 1000
    }}>
      {/* Raw video element with minimal styling */}
      <video
        ref={videoRef}
        style={{
          width: '400px',
          height: '300px',
          border: '2px solid red',
          backgroundColor: 'blue',
          display: 'block',
          margin: '20px auto'
        }}
        playsInline
        muted
        autoPlay
        controls
        onLoadedMetadata={() => addLog('onLoadedMetadata fired')}
        onLoadedData={() => addLog('onLoadedData fired')}
        onCanPlay={() => addLog('onCanPlay fired')}
        onPlay={() => addLog('onPlay fired')}
        onTimeUpdate={() => {
          if (videoRef.current && videoRef.current.currentTime > 0) {
            addLog(`Video playing - time: ${videoRef.current.currentTime.toFixed(2)}`);
          }
        }}
        onError={(e) => addLog(`Video error: ${e}`)}
      />

      {/* Controls */}
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <Button onClick={forceRestart} style={{ margin: '5px' }}>
          Restart Camera
        </Button>
        <Button onClick={testVideoElement} style={{ margin: '5px' }}>
          Test Video Element
        </Button>
        <Button onClick={onClose} style={{ margin: '5px' }}>
          Close
        </Button>
      </div>

      {/* Logs */}
      <div style={{ 
        margin: '20px', 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        height: '200px', 
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <strong>Logs:</strong>
        <br />
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* Stream info */}
      {stream && (
        <div style={{ 
          margin: '20px', 
          padding: '10px', 
          backgroundColor: '#e0f0e0',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Stream Info:</strong>
          <br />
          Video tracks: {stream.getVideoTracks().length}
          <br />
          {stream.getVideoTracks().map((track, index) => (
            <div key={index}>
              Track {index}: {track.label} - {track.readyState} - {track.kind}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}