import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CameraPreview } from './CameraPreview';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface FaceRecognitionProps {
  onGenderDetected: (gender: 'male' | 'female', selectedStyle?: HairstyleOption) => void;
  onSkip?: () => void;
}

interface HairstyleOption {
  id: string;
  name: string;
  image: string;
  gender: 'male' | 'female' | 'unisex';
}

const HAIRSTYLE_OPTIONS: HairstyleOption[] = [
  {
    id: 'men-modern',
    name: 'Modern Cut',
    image: 'https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBoYWlyY3V0JTIwc3R5bGVzJTIwbW9kZXJufGVufDF8fHx8MTc1NzAwODQ5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'male'
  },
  {
    id: 'men-fade',
    name: 'Fade Cut',
    image: 'https://images.unsplash.com/photo-1514336937476-a5b961020a5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwZmFkZSUyMGhhaXJjdXQlMjBiYXJiZXJzaG9wfGVufDF8fHx8MTc1NzAwODUwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'male'
  },
  {
    id: 'women-modern',
    name: 'Layered Style',
    image: 'https://images.unsplash.com/photo-1580027297283-d4a06e2a7ac2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhaXJjdXQlMjBzdHlsZXMlMjBtb2Rlcm58ZW58MXx8fHwxNzU3MDA4NTAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'female'
  },
  {
    id: 'women-long',
    name: 'Long Waves',
    image: 'https://images.unsplash.com/photo-1522336552288-a9cc74a8dfd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxvbmclMjBoYWlyJTIwc3R5bGUlMjBzYWxvbnxlbnwxfHx8fDE3NTcwMDg1MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'female'
  },
  {
    id: 'women-pixie',
    name: 'Pixie Cut',
    image: 'https://images.unsplash.com/photo-1599042426110-03e7730293cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMHBpeGllJTIwY3V0JTIwd29tZW4lMjBoYWlyc3R5bGV8ZW58MXx8fHwxNzU3MDA4NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'female'
  },
  {
    id: 'women-curly',
    name: 'Curly Style',
    image: 'https://images.unsplash.com/photo-1712641966810-611ff1503c6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJseSUyMGhhaXIlMjBzdHlsZSUyMHdvbWVuJTIwc2Fsb258ZW58MXx8fHwxNzU3MDA4NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    gender: 'female'
  }
];

export function FaceRecognition({ onGenderDetected, onSkip }: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | null>(null);
  const [error, setError] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedHairstyle, setSelectedHairstyle] = useState<HairstyleOption | null>(null);
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [showStylePreview, setShowStylePreview] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  useEffect(() => {
    checkCameraPermission();
    enumerateCameras();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const enumerateCameras = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        console.log('Available cameras:', cameras.length);
      }
    } catch (err) {
      console.log('Could not enumerate cameras:', err);
    }
  };

  const checkCameraPermission = async () => {
    try {
      // Check if we have camera permission without requesting it yet
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'granted') {
          setPermissionState('granted');
        } else if (permission.state === 'denied') {
          setPermissionState('denied');
          setError('Camera access was previously denied. Please enable camera access in your browser settings or skip this step.');
          setShowPermissionHelp(true);
        } else {
          setPermissionState('unknown');
        }
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          const newState = permission.state as 'granted' | 'denied' | 'unknown';
          setPermissionState(newState);
          if (newState === 'denied') {
            setError('Camera access was denied. Please enable camera access in your browser settings or skip this step.');
            setShowCamera(true);
            setShowPermissionHelp(true);
          } else if (newState === 'granted') {
            setError('');
            setShowPermissionHelp(false);
            setShowCamera(false); // Reset camera state so user can try again
          }
        });
      } else {
        // Fallback for browsers that don't support permissions API
        setPermissionState('unknown');
      }
    } catch (err) {
      console.log('Permission check not supported, proceeding with camera request');
      setPermissionState('unknown');
    }
  };

  const startCamera = async () => {
    try {
      setError(''); // Clear any previous errors
      setIsCapturing(true); // Show loading state
      setShowPermissionHelp(false);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }
      
      // Request camera with improved constraints for better system camera access
      let constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640, min: 320, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15, max: 60 }
        },
        audio: false
      };

      // Try with strict constraints first, fallback to simpler ones if needed
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstError: any) {
        console.log('First attempt failed, trying simpler constraints:', firstError.name);
        
        // Fallback to simpler constraints
        constraints = {
          video: {
            facingMode: 'user'
          },
          audio: false
        };
        
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (secondError: any) {
          console.log('Second attempt failed, trying basic video:', secondError.name);
          
          // Final fallback - just request video
          constraints = { video: true, audio: false };
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        }
      }
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load before showing camera
        videoRef.current.addEventListener('loadedmetadata', () => {
          setPermissionState('granted');
          setShowCamera(true);
          setIsCapturing(false);
          setError('');
        }, { once: true });

        // Handle video errors
        videoRef.current.addEventListener('error', (e) => {
          console.error('Video error:', e);
          setError('Error loading camera feed. Please try again.');
          setIsCapturing(false);
        }, { once: true });
      } else {
        setPermissionState('granted');
        setShowCamera(true);
        setIsCapturing(false);
        setError('');
      }
    } catch (err: any) {
      console.error('Camera access issue:', err);
      
      setPermissionState('denied');
      setShowCamera(true); // Show the error UI
      setIsCapturing(false);
      setShowPermissionHelp(true);
      
      // Provide specific error messages based on the error type
      if (err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera access in your browser and try again.');
      } else if (err.name === 'NotFoundError') {
        setError(`No camera found. ${availableCameras.length === 0 ? 'Please connect a camera device' : 'Camera may be disconnected'} or skip this step.`);
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application. Please close other apps using the camera and try again.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera does not support the required settings. Please try again or skip this step.');
      } else if (err.message?.includes('not supported')) {
        setError('Camera access not supported in this browser. Please use a modern browser or skip this step.');
      } else {
        setError('Unable to access camera. Please check your camera settings and permissions, then try again.');
      }
    }
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Simulate face recognition analysis with more realistic timing
      setTimeout(() => {
        // For demo purposes, we'll randomly detect gender
        // In a real app, this would use ML models like TensorFlow.js, face-api.js, or MediaPipe
        const genders: ('male' | 'female')[] = ['male', 'female'];
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        
        setDetectedGender(randomGender);
        setIsAnalyzing(false);
        setShowStylePreview(true);
        
        // Set initial hairstyle based on detected gender
        const genderStyles = HAIRSTYLE_OPTIONS.filter(style => 
          style.gender === randomGender || style.gender === 'unisex'
        );
        if (genderStyles.length > 0) {
          setSelectedHairstyle(genderStyles[0]);
          setCurrentStyleIndex(0);
        }
      }, 1500);
    }
  };

  const getAvailableStyles = () => {
    if (detectedGender) {
      return HAIRSTYLE_OPTIONS.filter(style => 
        style.gender === detectedGender || style.gender === 'unisex'
      );
    }
    return HAIRSTYLE_OPTIONS;
  };

  const nextHairstyle = () => {
    const availableStyles = getAvailableStyles();
    const nextIndex = (currentStyleIndex + 1) % availableStyles.length;
    setCurrentStyleIndex(nextIndex);
    setSelectedHairstyle(availableStyles[nextIndex]);
  };

  const previousHairstyle = () => {
    const availableStyles = getAvailableStyles();
    const prevIndex = currentStyleIndex === 0 ? availableStyles.length - 1 : currentStyleIndex - 1;
    setCurrentStyleIndex(prevIndex);
    setSelectedHairstyle(availableStyles[prevIndex]);
  };

  const handleConfirm = () => {
    if (detectedGender) {
      onGenderDetected(detectedGender, selectedHairstyle || undefined);
    }
  };

  const handleCameraPreviewCapture = (imageData: string) => {
    console.log('Photo captured:', imageData);
    // You could save this or use it for analysis
  };

  const handleCameraPreviewClose = () => {
    setShowCameraPreview(false);
    // Clean up any existing stream to avoid conflicts
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleRetry = () => {
    setDetectedGender(null);
    setIsAnalyzing(false);
    setShowStylePreview(false);
    setSelectedHairstyle(null);
    setCurrentStyleIndex(0);
  };

  const resetCameraState = () => {
    setError('');
    setShowCamera(false);
    setPermissionState('unknown');
    setDetectedGender(null);
    setIsAnalyzing(false);
    setShowStylePreview(false);
    setSelectedHairstyle(null);
    setCurrentStyleIndex(0);
    setShowPermissionHelp(false);
    
    // Clean up existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const refreshPermissions = () => {
    // Reset all states and try again
    resetCameraState();
    // Small delay to ensure state is reset
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (showCameraPreview) {
    return (
      <CameraPreview
        onClose={handleCameraPreviewClose}
        onCapture={handleCameraPreviewCapture}
        gender={detectedGender || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 mb-4 flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="Groomer" 
              className="h-full w-auto object-contain opacity-70"
            />
          </div>
          <h1 className="text-2xl">Personalize Your Experience</h1>
          <p className="text-muted-foreground max-w-sm">
            {!showCamera && !error
              ? permissionState === 'denied' 
                ? "Camera access was denied. You can enable it in your browser settings or continue with manual selection to see personalized recommendations."
                : "Try different hairstyles in real-time using your camera, or choose your gender manually for personalized recommendations."
              : showCamera && !error && !detectedGender
                ? "Position your face in the camera and explore different hairstyles below"
                : showStylePreview
                  ? "Use the arrows to try different styles that suit your face"
                  : "Choose how you'd like to personalize your salon experience"
            }
          </p>
        </div>

        {/* Camera area with hairstyle preview */}
        {showCamera && (
          <div className="relative">
            <div className="w-80 h-60 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border">
              {error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3">
                  <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                  <p className="text-sm text-destructive mb-3">{error}</p>
                  
                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg mb-3 space-y-1">
                    <p className="font-medium mb-2">Camera Permission Steps:</p>
                    <p>1. Look for the camera icon (🎥) in your browser's address bar</p>
                    <p>2. Click it and select "Allow" for camera access</p>
                    <p>3. Refresh this page or click "Try Again"</p>
                    <div className="mt-2 p-2 bg-muted/30 rounded space-y-1">
                      <p className="text-xs font-medium">Alternative methods:</p>
                      <p className="text-xs">• Browser settings → Privacy & Security → Camera → Allow this site</p>
                      <p className="text-xs">• Clear site data and try again</p>
                      <Button 
                        onClick={refreshPage}
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 px-2 text-xs"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={refreshPermissions}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    {onSkip && (
                      <Button 
                        onClick={onSkip} 
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        <span className="mr-2">👤</span>
                        Continue Without Camera
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Hairstyle Preview Overlay */}
            {showStylePreview && selectedHairstyle && !error && (
              <div className="absolute inset-0 rounded-lg">
                {/* Semi-transparent overlay with style preview */}
                <div className="absolute top-2 right-2 bg-white/90 rounded-lg p-2 shadow-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={selectedHairstyle.image}
                      alt={selectedHairstyle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs mt-1 text-center font-medium">{selectedHairstyle.name}</p>
                </div>

                {/* Navigation controls */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={previousHairstyle}
                    className="bg-white/90 hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="bg-white/90 px-3 py-1 rounded-full">
                    <p className="text-xs font-medium">
                      {currentStyleIndex + 1} of {getAvailableStyles().length}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={nextHairstyle}
                    className="bg-white/90 hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {detectedGender && !showStylePreview && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <h3 className="font-medium">Gender Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    {detectedGender === 'male' ? 'Male' : 'Female'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hairstyle Gallery - Show when camera is active */}
        {showCamera && !error && !detectedGender && (
          <div className="w-80">
            <h3 className="text-sm font-medium mb-3 text-center">Try Different Hairstyles</h3>
            <div className="grid grid-cols-3 gap-2">
              {HAIRSTYLE_OPTIONS.slice(0, 6).map((style) => (
                <div key={style.id} className="relative group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-center mt-1 font-medium">{style.name}</p>
                  <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                    {style.gender === 'male' ? 'M' : style.gender === 'female' ? 'F' : 'U'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-3 w-80">
          {/* Show initial choice when no camera is active */}
          {!showCamera && !detectedGender && (
            <div className="space-y-3">
              {/* Show permission help if camera was previously denied */}
              {permissionState === 'denied' && showPermissionHelp && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-destructive">Camera Access Required</p>
                      <p className="text-xs text-muted-foreground">
                        Camera permission was denied. To use face recognition:
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>1. Click the camera icon (🎥) in your browser's address bar</p>
                        <p>2. Select "Allow" for camera access</p>
                        <p>3. Refresh this page</p>
                        <p className="text-xs opacity-75 mt-2">Or continue without the camera feature below</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={() => setShowCameraPreview(true)}
                  className="w-full"
                  disabled={isCapturing}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Try Hairstyles with Camera
                </Button>
                
                <Button 
                  onClick={startCamera}
                  className="w-full"
                  disabled={isCapturing || permissionState === 'denied'}
                  variant={permissionState === 'denied' ? 'outline' : 'outline'}
                >
                  {isCapturing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Accessing Camera...
                    </>
                  ) : permissionState === 'denied' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Camera Again
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Use Face Recognition
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => onGenderDetected('male')}
                    className="flex-1"
                    disabled={isCapturing}
                  >
                    <span className="mr-2">👨</span>
                    Men's Styles
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onGenderDetected('female')}
                    className="flex-1"
                    disabled={isCapturing}
                  >
                    <span className="mr-2">👩</span>
                    Women's Styles
                  </Button>
                </div>
                
                {onSkip && (
                  <Button 
                    variant="ghost"
                    onClick={onSkip}
                    className="w-full text-sm"
                    disabled={isCapturing}
                  >
                    Skip personalization for now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Show analyze button when camera is ready */}
          {showCamera && !detectedGender && !isAnalyzing && !error && (
            <div className="space-y-2">
              <Button 
                onClick={captureAndAnalyze} 
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Analyze Face & Try Styles
              </Button>
              <Button 
                variant="outline"
                onClick={() => onGenderDetected('male')}
                className="w-full"
              >
                Browse Men's Styles
              </Button>
              <Button 
                variant="outline"
                onClick={() => onGenderDetected('female')}
                className="w-full"
              >
                Browse Women's Styles
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-2 py-3">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}

          {showStylePreview && detectedGender && (
            <div className="space-y-2">
              <Button onClick={handleConfirm} className="w-full">
                Continue with {selectedHairstyle?.name || (detectedGender === 'male' ? 'Men\'s' : 'Women\'s')} Style
              </Button>
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Try Different Style
              </Button>
            </div>
          )}

          {/* Show skip option when camera is active but no gender detected */}
          {showCamera && !detectedGender && !isAnalyzing && !error && onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          )}

          {/* Show back option when there's an error */}
          {error && !detectedGender && (
            <Button 
              variant="ghost" 
              onClick={() => {
                resetCameraState();
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to options
            </Button>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground max-w-xs">
            Your image is processed locally and not stored anywhere
          </p>
          {availableCameras.length > 0 && (
            <p className="text-xs text-muted-foreground/70">
              {availableCameras.length} camera{availableCameras.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}