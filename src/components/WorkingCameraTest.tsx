import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

interface WorkingCameraTestProps {
  onClose: () => void;
}

export function WorkingCameraTest({ onClose }: WorkingCameraTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    setStatus('Requesting camera...');
    
    try {
      // Try multiple constraint combinations
      const constraints = [
        { video: { width: 640, height: 480, facingMode: 'user' } },
        { video: { width: 320, height: 240 } },
        { video: true }
      ];

      let mediaStream = null;
      
      for (const constraint of constraints) {
        try {
          setStatus(`Trying constraint: ${JSON.stringify(constraint)}`);
          mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          console.log(`Constraint failed:`, constraint, err);
          continue;
        }
      }

      if (!mediaStream) {
        throw new Error('No camera constraints worked');
      }

      setStatus('Got media stream, setting up video...');
      setStream(mediaStream);

      // Method 1: Direct assignment
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Clear any existing source
        video.srcObject = null;
        video.src = '';
        
        // Set properties BEFORE assigning source
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.controls = true; // Show controls for debugging
        
        // Wait a bit then assign stream
        setTimeout(() => {
          video.srcObject = mediaStream;
          setStatus('Video srcObject set, waiting for metadata...');
          
          // Force load
          video.load();
          
          // Try to play after a delay
          setTimeout(() => {
            video.play().then(() => {
              setStatus('Video playing!');
            }).catch(err => {
              setStatus(`Play failed: ${err.message}`);
              
              // Method 2: Try with blob URL as fallback
              tryBlobUrl(mediaStream);
            });
          }, 500);
          
        }, 100);
      }

    } catch (error: any) {
      setStatus(`Camera error: ${error.message}`);
      console.error('Camera initialization failed:', error);
    }
  };

  const tryBlobUrl = (mediaStream: MediaStream) => {
    setStatus('Trying blob URL method...');
    
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // Create a MediaRecorder to get blob data
    const mediaRecorder = new MediaRecorder(mediaStream);
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      video.srcObject = null;
      video.src = url;
      video.play().then(() => {
        setStatus('Video playing via blob URL!');
      }).catch(err => {
        setStatus(`Blob play failed: ${err.message}`);
        tryCanvasMethod(mediaStream);
      });
    };
    
    // Record for a short time to get some data
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 1000);
  };

  const tryCanvasMethod = (mediaStream: MediaStream) => {
    setStatus('Trying canvas method...');
    
    // Method 3: Use canvas to draw video frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tempVideo = document.createElement('video');
    
    tempVideo.srcObject = mediaStream;
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.autoplay = true;
    
    tempVideo.onloadedmetadata = () => {
      canvas.width = tempVideo.videoWidth;
      canvas.height = tempVideo.videoHeight;
      
      const drawFrame = () => {
        if (ctx && tempVideo.videoWidth > 0) {
          ctx.drawImage(tempVideo, 0, 0);
          
          // Convert canvas to blob and set as video source
          canvas.toBlob((blob) => {
            if (blob && videoRef.current) {
              const url = URL.createObjectURL(blob);
              videoRef.current.src = url;
              setStatus('Canvas method applied!');
            }
          });
        }
        requestAnimationFrame(drawFrame);
      };
      
      tempVideo.play().then(() => {
        drawFrame();
      });
    };
  };

  const forceRefresh = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setVideoLoaded(false);
    setStatus('Restarting...');
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    
    setTimeout(initCamera, 1000);
  };

  const checkVideoState = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const state = {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        muted: video.muted,
        readyState: video.readyState,
        networkState: video.networkState,
        hasSource: !!video.srcObject || !!video.src,
        playing: !video.paused && video.currentTime > 0
      };
      
      setStatus(`Video state: ${JSON.stringify(state, null, 2)}`);
      console.log('Video state:', state);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Status */}
      <div style={{
        padding: '10px',
        backgroundColor: '#333',
        color: 'white',
        fontSize: '12px',
        whiteSpace: 'pre-wrap'
      }}>
        {status}
      </div>

      {/* Video container */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '80%',
            maxWidth: '600px',
            height: 'auto',
            border: '3px solid red',
            backgroundColor: 'blue'
          }}
          playsInline
          muted
          autoPlay
          controls
          onLoadedMetadata={() => {
            setStatus('✓ Metadata loaded');
            setVideoLoaded(true);
          }}
          onLoadedData={() => {
            setStatus('✓ Data loaded');
          }}
          onCanPlay={() => {
            setStatus('✓ Can play');
          }}
          onPlay={() => {
            setStatus('✓ Playing!');
          }}
          onTimeUpdate={() => {
            if (videoRef.current && videoRef.current.currentTime > 0) {
              setStatus(`✓ Playing at ${videoRef.current.currentTime.toFixed(1)}s`);
            }
          }}
          onError={(e) => {
            setStatus(`✗ Video error: ${e}`);
          }}
        />
      </div>

      {/* Controls */}
      <div style={{
        padding: '10px',
        backgroundColor: '#333',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <Button onClick={forceRefresh}>
          Restart Camera
        </Button>
        <Button onClick={checkVideoState}>
          Check Video State
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Stream info */}
      {stream && (
        <div style={{
          padding: '10px',
          backgroundColor: '#e0e0e0',
          fontSize: '11px',
          borderTop: '1px solid #ccc'
        }}>
          <strong>Stream Info:</strong><br />
          Active: {stream.active ? 'Yes' : 'No'}<br />
          Video tracks: {stream.getVideoTracks().length}<br />
          {stream.getVideoTracks().map((track, i) => (
            <div key={i}>
              Track {i}: {track.label} - {track.readyState} - {track.enabled ? 'enabled' : 'disabled'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}