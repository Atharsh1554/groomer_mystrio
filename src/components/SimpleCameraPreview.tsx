import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Camera, X, RotateCcw, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Hairstyle {
  id: string;
  name: string;
  thumbnail: string;
  overlay: string;
  gender: 'male' | 'female';
}

interface SimpleCameraPreviewProps {
  onClose: () => void;
  onCapture?: (imageData: string) => void;
  onHairstyleSelect?: (hairstyle: Hairstyle) => void;
  gender?: 'male' | 'female';
}

// Sample hairstyles data
const hairstyles: Hairstyle[] = [
  {
    id: 'women-1',
    name: 'Classic Long',
    thumbnail: 'https://images.unsplash.com/photo-1583743599150-3b6048ecf084?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhaXJzdHlsZSUyMHNhbG9ufGVufDF8fHx8MTc1NzEzOTk3NXww&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1583743599150-3b6048ecf084?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhaXJzdHlsZSUyMHNhbG9ufGVufDF8fHx8MTc1NzEzOTk3NXww&ixlib=rb-4.1.0&q=80&w=600',
    gender: 'female'
  },
  {
    id: 'women-2',
    name: 'Short & Chic',
    thumbnail: 'https://images.unsplash.com/photo-1633515104414-6d905d3c30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMHdvbWVuJTIwaGFpcmN1dHxlbnwxfHx8fDE3NTcxMzk5ODF8MA&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1633515104414-6d905d3c30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMHdvbWVuJTIwaGFpcmN1dHxlbnwxfHx8fDE3NTcxMzk5ODF8MA&ixlib=rb-4.1.0&q=80&w=600',
    gender: 'female'
  },
  {
    id: 'men-1',
    name: 'Modern Cut',
    thumbnail: 'https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZW4lMjBoYWlyY3V0fGVufDF8fHx8MTc1NzEzOTk4N3ww&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZW4lMjBoYWlyY3V0fGVufDF8fHx8MTc1NzEzOTk4N3ww&ixlib=rb-4.1.0&q=80&w=600',
    gender: 'male'
  },
  {
    id: 'men-2',
    name: 'Classic Style',
    thumbnail: 'https://images.unsplash.com/photo-1706769015484-248bd241945c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbWVuJTIwaGFpcmN1dHxlbnwxfHx8fDE3NTcxMzk5ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1706769015484-248bd241945c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwbWVuJTIwaGFpcmN1dHxlbnwxfHx8fDE3NTcxMzk5ODl8MA&ixlib=rb-4.1.0&q=80&w=600',
    gender: 'male'
  }
];

export function SimpleCameraPreview({ onClose, onCapture, onHairstyleSelect, gender }: SimpleCameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Filter hairstyles based on gender
  const filteredHairstyles = gender 
    ? hairstyles.filter(h => h.gender === gender)
    : hairstyles;

  useEffect(() => {
    initializeCamera();
    
    return () => {
      cleanupCamera();
    };
  }, []);

  // Auto-select first hairstyle
  useEffect(() => {
    if (filteredHairstyles.length > 0 && !selectedHairstyle) {
      setSelectedHairstyle(filteredHairstyles[0]);
    }
  }, [filteredHairstyles, selectedHairstyle]);

  const cleanupCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind, track.label);
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      console.log('Requesting camera access...');
      
      // Request basic camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Camera stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());

      setStream(mediaStream);

      if (videoRef.current) {
        // Clear any previous source
        videoRef.current.srcObject = null;
        
        // Set the new stream
        videoRef.current.srcObject = mediaStream;
        
        // Set video properties directly
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Add event listeners
        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          setVideoReady(true);
          setIsLoading(false);
          toast.success('Camera ready! Try different hairstyles below.');
        };

        const handleLoadedData = () => {
          console.log('Video data loaded');
        };

        const handlePlay = () => {
          console.log('Video started playing');
        };

        const handleError = (e: any) => {
          console.error('Video error:', e);
          setError('Failed to display camera feed');
          setIsLoading(false);
        };

        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoRef.current.addEventListener('loadeddata', handleLoadedData);
        videoRef.current.addEventListener('play', handlePlay);
        videoRef.current.addEventListener('error', handleError);

        // Try to play the video
        try {
          await videoRef.current.play();
          console.log('Video play() successful');
        } catch (playError) {
          console.log('Video play() failed, but continuing:', playError);
          // Don't treat this as a fatal error - the video might still work
        }
      }

    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setIsLoading(false);
      
      let errorMessage = 'Unable to access camera.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is busy. Please close other apps using the camera.';
      }
      
      setError(errorMessage);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !videoReady) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    context.drawImage(video, 0, 0);
    
    // Draw hairstyle overlay if selected
    if (selectedHairstyle) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        context.globalAlpha = 0.7;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0;
        
        const imageData = canvas.toDataURL('image/png');
        onCapture?.(imageData);
      };
      img.src = selectedHairstyle.overlay;
    } else {
      const imageData = canvas.toDataURL('image/png');
      onCapture?.(imageData);
    }
  };

  const handleHairstyleSelect = (hairstyle: Hairstyle) => {
    setSelectedHairstyle(hairstyle);
    onHairstyleSelect?.(hairstyle);
  };

  const retryCamera = () => {
    cleanupCamera();
    setVideoReady(false);
    setError(null);
    setTimeout(() => {
      initializeCamera();
    }, 500);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center bg-card">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
          <h3 className="text-lg mb-2">Camera Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={retryCamera} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center bg-card">
          <div className="w-12 h-12 mx-auto mb-3 relative">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <Camera className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <h3 className="text-lg mb-2">Starting Camera</h3>
          <p className="text-muted-foreground mb-4">
            Initializing camera feed...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ 
            transform: 'scaleX(-1)',
            backgroundColor: '#000000'
          }}
          playsInline
          muted
          autoPlay
          onLoadedMetadata={() => {
            console.log('onLoadedMetadata event fired');
          }}
          onLoadedData={() => {
            console.log('onLoadedData event fired');
          }}
          onCanPlay={() => {
            console.log('onCanPlay event fired');
          }}
          onPlay={() => {
            console.log('onPlay event fired');
          }}
          onTimeUpdate={() => {
            // This will fire continuously when video is playing
            // We can use this to confirm video is actually playing
          }}
        />
        
        {/* Debug Info Overlay */}
        {videoReady && (
          <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs">
            Video: {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}
            <br />
            Stream: {stream?.getVideoTracks().length} tracks
            <br />
            Ready: {videoReady ? 'Yes' : 'No'}
          </div>
        )}
        
        {/* Hairstyle Overlay */}
        {selectedHairstyle && videoReady && (
          <div className="absolute inset-0 pointer-events-none">
            <ImageWithFallback
              src={selectedHairstyle.overlay}
              alt={`${selectedHairstyle.name} overlay`}
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
            />
          </div>
        )}
        
        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Bottom Toolbar */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHairstyle(null)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              onClick={capturePhoto}
              className="bg-white text-black hover:bg-white/90 rounded-full w-16 h-16 p-0"
              disabled={!videoReady}
            >
              <Camera className="w-6 h-6" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={retryCamera}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1"
            >
              Restart Camera
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
      
      {/* Hairstyle Selector */}
      <div className="bg-black/90 border-t border-white/10">
        <div className="px-4 py-3">
          <p className="text-white/80 mb-3">
            {videoReady ? 'Choose a hairstyle to try:' : 'Loading hairstyles...'}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredHairstyles.map((hairstyle) => (
              <button
                key={hairstyle.id}
                onClick={() => handleHairstyleSelect(hairstyle)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedHairstyle?.id === hairstyle.id
                    ? 'border-white scale-110'
                    : 'border-white/30'
                }`}
              >
                <ImageWithFallback
                  src={hairstyle.thumbnail}
                  alt={hairstyle.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          {selectedHairstyle && (
            <p className="text-white/60 mt-2 text-center">{selectedHairstyle.name}</p>
          )}
        </div>
      </div>
    </div>
  );
}