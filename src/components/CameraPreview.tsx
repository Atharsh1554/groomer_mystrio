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

interface CameraPreviewProps {
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
    id: 'women-3',
    name: 'Curly Volume',
    thumbnail: 'https://images.unsplash.com/photo-1664289573148-9df5c51c913d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJseSUyMHdvbWVuJTIwaGFpcnN0eWxlfGVufDF8fHx8MTc1NzEzOTk4NHww&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1664289573148-9df5c51c913d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJseSUyMHdvbWVuJTIwaGFpcnN0eWxlfGVufDF8fHx8MTc1NzEzOTk4NHww&ixlib=rb-4.1.0&q=80&w=600',
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
  },
  {
    id: 'men-3',
    name: 'Fresh Fade',
    thumbnail: 'https://images.unsplash.com/photo-1654097800369-abc063d657c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBoYWlyc3R5bGUlMjBiYXJiZXJ8ZW58MXx8fHwxNzU3MTM5OTc4fDA&ixlib=rb-4.1.0&q=80&w=400',
    overlay: 'https://images.unsplash.com/photo-1654097800369-abc063d657c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBoYWlyc3R5bGUlMjBiYXJiZXJ8ZW58MXx8fHwxNzU3MTM5OTc4fDA&ixlib=rb-4.1.0&q=80&w=600',
    gender: 'male'
  }
];

export function CameraPreview({ onClose, onCapture, onHairstyleSelect, gender }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  // Filter hairstyles based on gender
  const filteredHairstyles = gender 
    ? hairstyles.filter(h => h.gender === gender)
    : hairstyles;

  useEffect(() => {
    // Check permission status and start camera automatically
    checkPermissionStatus();
    
    // Auto-start camera after a short delay to allow permission check
    const timer = setTimeout(() => {
      startCamera();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Auto-select first hairstyle on mount
  useEffect(() => {
    if (filteredHairstyles.length > 0 && !selectedHairstyle) {
      setSelectedHairstyle(filteredHairstyles[0]);
    }
  }, [filteredHairstyles, selectedHairstyle]);

  const checkPermissionStatus = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permission.state as 'granted' | 'denied' | 'unknown');
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          setPermissionState(permission.state as 'granted' | 'denied' | 'unknown');
        });
      }
    } catch (error) {
      console.log('Permission check not supported');
      setPermissionState('unknown');
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      // Try with fallback constraints
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 320, max: 1920 },
            height: { ideal: 720, min: 240, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 30, min: 10, max: 60 }
          }
        });
      } catch (firstError) {
        console.log('First camera attempt failed, trying simpler constraints');
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          });
        } catch (secondError) {
          console.log('Second camera attempt failed, trying basic video');
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        // Clear any existing source first
        videoRef.current.srcObject = null;
        
        // Small delay to ensure proper cleanup
        setTimeout(() => {
          if (videoRef.current && mediaStream) {
            console.log('Setting video source to stream');
            videoRef.current.srcObject = mediaStream;
            
            // Ensure video element properties are set correctly
            videoRef.current.playsInline = true;
            videoRef.current.muted = true;
            videoRef.current.autoplay = true;
          }
        }, 100);
        
        // Set up video event handlers
        const handleVideoReady = () => {
          console.log('Video ready - dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          setIsLoading(false);
          setCameraReady(true);
          setPermissionState('granted');
          toast.success('Camera is ready! Try different hairstyles below.');
        };
        
        const handleVideoError = (e: Event) => {
          console.error('Video error:', e);
          setIsLoading(false);
          setCameraError('Error loading camera feed. Please refresh the page and try again.');
        };
        
        const handleCanPlay = () => {
          console.log('Video can play');
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.log('Autoplay failed, trying manual play:', err);
            });
          }
        };
        
        // Add multiple event listeners for better compatibility
        videoRef.current.addEventListener('loadedmetadata', handleVideoReady, { once: true });
        videoRef.current.addEventListener('loadeddata', handleCanPlay, { once: true });
        videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
        videoRef.current.addEventListener('error', handleVideoError, { once: true });
        
        // Ensure video plays
        const playVideo = async () => {
          if (videoRef.current) {
            try {
              // Force dimensions to help with display
              videoRef.current.style.width = '100%';
              videoRef.current.style.height = '100%';
              videoRef.current.style.objectFit = 'cover';
              
              await videoRef.current.play();
              console.log('Video playing successfully');
            } catch (playError) {
              console.log('Initial play failed, will try again:', playError);
              // Try again after a short delay
              setTimeout(async () => {
                try {
                  await videoRef.current?.play();
                } catch (retryError) {
                  console.log('Retry play failed:', retryError);
                }
              }, 500);
            }
          }
        };
        
        // Start playing video
        playVideo();
      } else {
        setIsLoading(false);
        setCameraReady(true);
        setPermissionState('granted');
      }
      
    } catch (error: any) {
      console.error('Camera access error:', error);
      setIsLoading(false);
      setCameraReady(false);
      
      let errorMessage = 'Unable to access camera. Please try again.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access was denied. Please click "Allow" when your browser asks for camera permission.';
        setPermissionState('denied');
        toast.error('Camera access denied. You can still preview hairstyles without the camera.');
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera device and try again.';
        toast.error('No camera detected. Please connect a camera device.');
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is busy. Please close other apps using the camera and try again.';
        toast.error('Camera is busy. Close other apps using the camera.');
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported. Please try again.';
        toast.error('Camera settings not supported.');
      } else if (error.message?.includes('not supported')) {
        errorMessage = 'Camera not supported in this browser. Please use Chrome, Firefox, or Safari.';
        toast.error('Camera not supported in this browser.');
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped camera track:', track.kind);
      });
      setStream(null);
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
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
        context.globalAlpha = 0.7; // Make overlay semi-transparent
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

  // Show initial loading screen while camera is starting
  if (!cameraReady && !cameraError && isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center bg-card">
          <div className="mb-6">
            <div className="w-12 h-12 mx-auto mb-3 relative">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <Camera className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <h3 className="text-lg mb-2">Starting Camera</h3>
            <p className="text-muted-foreground mb-4">
              Please allow camera access when prompted by your browser. This may take a few seconds.
            </p>
            
            {permissionState === 'denied' && (
              <div className="text-left bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4 space-y-3">
                <p className="font-medium text-sm text-destructive">Camera Permission Blocked</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">1</span>
                    <p>Look for the camera icon (🎥) in your browser's address bar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">2</span>
                    <p>Click it and select "Allow" for camera access</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">3</span>
                    <p>Refresh the page to try again</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Skip Camera Preview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show manual permission request if camera failed to start automatically
  if (!cameraReady && !cameraError && !isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center bg-card">
          <div className="mb-6">
            <Camera className="w-12 h-12 mx-auto text-primary mb-3" />
            <h3 className="text-lg mb-2">Camera Access Needed</h3>
            <p className="text-muted-foreground mb-4">
              To try different hairstyles, we need access to your camera. Your video stays private and is not recorded.
            </p>
            
            {permissionState === 'denied' && (
              <div className="text-left bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4 space-y-3">
                <p className="font-medium text-sm text-destructive">Camera Permission Blocked</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">1</span>
                    <p>Look for the camera icon (🎥) in your browser's address bar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">2</span>
                    <p>Click it and select "Allow" for camera access</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-destructive/10 rounded-full flex items-center justify-center text-destructive font-medium text-xs">3</span>
                    <p>Click "Enable Camera" below</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={startCamera} 
              className="w-full"
              disabled={isLoading}
            >
              <Camera className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Skip Camera Preview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show error screen if camera access failed
  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center bg-card">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
            <h3 className="text-lg mb-2">Camera Access Issue</h3>
            <p className="text-muted-foreground mb-4">{cameraError}</p>
            
            {/* Permission help steps */}
            <div className="text-left bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
              <p className="font-medium text-sm">Troubleshooting steps:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">1</span>
                  <p>Check if other apps are using your camera</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">2</span>
                  <p>Look for the camera icon (🎥) in your browser's address bar and click "Allow"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">3</span>
                  <p>Refresh the page and try again</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button onClick={startCamera} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Continue without camera
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.reload()} 
              className="w-full text-sm"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View Container */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white space-y-3">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <p className="mb-1">Starting camera...</p>
                <p className="text-sm text-white/60">Please allow camera access when prompted</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Video Element or Placeholder */}
        {cameraReady ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-black"
            playsInline
            muted
            autoPlay
            controls={false}
            style={{ 
              transform: 'scaleX(-1)',
              minHeight: '100%',
              minWidth: '100%'
            }}
            onLoadedMetadata={() => {
              console.log('Video metadata loaded');
              if (videoRef.current) {
                console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
              }
            }}
            onLoadedData={() => {
              console.log('Video data loaded');
            }}
            onCanPlay={() => {
              console.log('Video can play');
            }}
            onPlay={() => {
              console.log('Video started playing');
            }}
            onError={(e) => {
              console.error('Video element error:', e);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <div className="w-24 h-32 bg-white/10 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
              <p className="text-white/60">Camera Preview</p>
            </div>
          </div>
        )}
        
        {/* Hairstyle Overlay */}
        {selectedHairstyle && (
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
            Reset Style
          </Button>
          
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              onClick={cameraReady ? capturePhoto : startCamera}
              className="bg-white text-black hover:bg-white/90 rounded-full w-16 h-16 p-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : cameraReady ? (
                <Camera className="w-6 h-6" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </Button>
            
            {/* Show restart camera button if camera is ready but might not be displaying */}
            {cameraReady && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Force restart video
                  if (videoRef.current && stream) {
                    videoRef.current.srcObject = null;
                    setTimeout(() => {
                      if (videoRef.current && stream) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play().catch(err => console.log('Restart play error:', err));
                      }
                    }, 100);
                  }
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1"
              >
                Restart Video
              </Button>
            )}
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
      
      {/* Hairstyle Selector Carousel */}
      <div className="bg-black/90 border-t border-white/10">
        <div className="px-4 py-3">
          <p className="text-white/80 mb-3">
            {cameraReady ? 'Choose a hairstyle to try:' : 'Preview hairstyles:'}
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
          {!cameraReady && (
            <p className="text-white/40 mt-2 text-center text-sm">
              Enable camera to see hairstyles on your face
            </p>
          )}
        </div>
      </div>
    </div>
  );
}