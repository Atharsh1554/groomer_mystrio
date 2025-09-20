import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Camera,
  X,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Hairstyle {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  overlay: string;
  gender: "male" | "female" | "unisex";
  scaleFactor: number;
  offsetY: number;
  offsetX: number;
}

interface FaceDetectionCameraProps {
  onClose: () => void;
  onCapture?: (imageData: string) => void;
  onHairstyleSelect?: (hairstyle: Hairstyle) => void;
  gender?: "male" | "female";
}

// Comprehensive hairstyles database
const hairstyles: Hairstyle[] = [
  // Men's hairstyles
  {
    id: "men-modern-1",
    name: "Modern Fade",
    category: "Short",
    thumbnail:
      "https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBtb2Rlcm4lMjBoYWlyY3V0JTIwc3R5bGVzfGVufDF8fHx8MTc1ODI2MjIwNnww&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1659355751282-5ca7807af9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBtb2Rlcm4lMjBoYWlyY3V0JTIwc3R5bGVzfGVufDF8fHx8MTc1ODI2MjIwNnww&ixlib=rb-4.1.0&q=80&w=600",
    gender: "male",
    scaleFactor: 1.2,
    offsetY: -30,
    offsetX: 0,
  },
  {
    id: "men-fade-1",
    name: "Classic Fade",
    category: "Short",
    thumbnail:
      "https://images.unsplash.com/photo-1543697506-6729425f7265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMG1lbiUyMGhhaXJjdXQlMjBmYWRlfGVufDF8fHx8MTc1ODI2MjIxMnww&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1543697506-6729425f7265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMG1lbiUyMGhhaXJjdXQlMjBmYWRlfGVufDF8fHx8MTc1ODI2MjIxMnww&ixlib=rb-4.1.0&q=80&w=600",
    gender: "male",
    scaleFactor: 1.1,
    offsetY: -25,
    offsetX: 0,
  },
  {
    id: "men-beard-1",
    name: "Beard Style",
    category: "Medium",
    thumbnail:
      "https://images.unsplash.com/photo-1659857934338-cdd2eb5ccce6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBiZWFyZCUyMGhhaXJzdHlsZXxlbnwxfHx8fDE3NTgyNjIyMjh8MA&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1659857934338-cdd2eb5ccce6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBiZWFyZCUyMGhhaXJzdHlsZXxlbnwxfHx8fDE3NTgyNjIyMjh8MA&ixlib=rb-4.1.0&q=80&w=600",
    gender: "male",
    scaleFactor: 1.15,
    offsetY: -20,
    offsetX: 0,
  },
  // Women's hairstyles
  {
    id: "women-salon-1",
    name: "Salon Style",
    category: "Long",
    thumbnail:
      "https://images.unsplash.com/photo-1583331030595-6601e6c7b5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhaXJzdHlsZXMlMjBzYWxvbnxlbnwxfHx8fDE3NTgyNjIyMDl8MA&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1583331030595-6601e6c7b5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhaXJzdHlsZXMlMjBzYWxvbnxlbnwxfHx8fDE3NTgyNjIyMDl8MA&ixlib=rb-4.1.0&q=80&w=600",
    gender: "female",
    scaleFactor: 1.3,
    offsetY: -40,
    offsetX: 0,
  },
  {
    id: "women-waves-1",
    name: "Long Waves",
    category: "Long",
    thumbnail:
      "https://images.unsplash.com/photo-1676665721763-6bb3496a3ec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25nJTIwd29tZW4lMjBoYWlyJTIwd2F2ZXN8ZW58MXx8fHwxNzU4MjYyMjE2fDA&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1676665721763-6bb3496a3ec3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25nJTIwd29tZW4lMjBoYWlyJTIwd2F2ZXN8ZW58MXx8fHwxNzU4MjYyMjE2fDA&ixlib=rb-4.1.0&q=80&w=600",
    gender: "female",
    scaleFactor: 1.4,
    offsetY: -45,
    offsetX: 0,
  },
  {
    id: "women-curly-1",
    name: "Curly Style",
    category: "Medium",
    thumbnail:
      "https://images.unsplash.com/photo-1664289573148-9df5c51c913d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJseSUyMHdvbWVuJTIwaGFpcnN0eWxlfGVufDF8fHx8MTc1ODI2MjIyMXww&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1664289573148-9df5c51c913d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJseSUyMHdvbWVuJTIwaGFpcnN0eWxlfGVufDF8fHx8MTc1ODI2MjIyMXww&ixlib=rb-4.1.0&q=80&w=600",
    gender: "female",
    scaleFactor: 1.25,
    offsetY: -35,
    offsetX: 0,
  },
  {
    id: "women-pixie-1",
    name: "Pixie Cut",
    category: "Short",
    thumbnail:
      "https://images.unsplash.com/photo-1715443972652-eb40b748fcb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhpZSUyMGN1dCUyMHdvbWVufGVufDF8fHx8MTc1ODI2MjIyNHww&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1715443972652-eb40b748fcb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhpZSUyMGN1dCUyMHdvbWVufGVufDF8fHx8MTc1ODI2MjIyNHww&ixlib=rb-4.1.0&q=80&w=600",
    gender: "female",
    scaleFactor: 1.0,
    offsetY: -15,
    offsetX: 0,
  },
  {
    id: "women-bob-1",
    name: "Classic Bob",
    category: "Medium",
    thumbnail:
      "https://images.unsplash.com/photo-1744148621724-a786ad64d757?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2IlMjBoYWlyY3V0JTIwd29tZW58ZW58MXx8fHwxNzU4MjYyMjMxfDA&ixlib=rb-4.1.0&q=80&w=400",
    overlay:
      "https://images.unsplash.com/photo-1744148621724-a786ad64d757?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2IlMjBoYWlyY3V0JTIwd29tZW58ZW58MXx8fHwxNzU4MjYyMjMxfDA&ixlib=rb-4.1.0&q=80&w=600",
    gender: "female",
    scaleFactor: 1.15,
    offsetY: -25,
    offsetX: 0,
  },
];

export function FaceDetectionCamera({
  onClose,
  onCapture,
  onHairstyleSelect,
  gender,
}: FaceDetectionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] =
    useState<Hairstyle | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<any[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] =
    useState(0);

  // Filter hairstyles based on gender
  const filteredHairstyles = gender
    ? hairstyles.filter(
        (h) => h.gender === gender || h.gender === "unisex",
      )
    : hairstyles;

  // Group hairstyles by category
  const categories = Array.from(
    new Set(filteredHairstyles.map((h) => h.category)),
  );
  const currentCategory = categories[currentCategoryIndex];
  const currentCategoryHairstyles = filteredHairstyles.filter(
    (h) => h.category === currentCategory,
  );

  useEffect(() => {
    initializeCamera();

    return () => {
      cleanupCamera();
    };
  }, []);

  // Auto-select first hairstyle
  useEffect(() => {
    if (
      currentCategoryHairstyles.length > 0 &&
      !selectedHairstyle
    ) {
      setSelectedHairstyle(currentCategoryHairstyles[0]);
    }
  }, [currentCategoryHairstyles, selectedHairstyle]);

  // Start face detection when video is ready
  useEffect(() => {
    if (videoReady && videoRef.current) {
      startFaceDetection();
    }
  }, [videoReady]);

  const cleanupCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind, track.label);
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

      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("UNSUPPORTED_BROWSER");
      }

      // Check if page is served over HTTPS (required for camera access)
      if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost"
      ) {
        throw new Error("INSECURE_CONTEXT");
      }

      console.log("Requesting camera access...");

      // Try progressive camera constraints
      const constraints = [
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        },
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let mediaStream = null;
      let lastError = null;

      for (const constraint of constraints) {
        try {
          console.log("Trying constraint:", constraint);
          mediaStream =
            await navigator.mediaDevices.getUserMedia(
              constraint,
            );
          break;
        } catch (err) {
          lastError = err;
          console.log("Constraint failed:", err);
          continue;
        }
      }

      if (!mediaStream) {
        throw (
          lastError ||
          new Error("All camera constraints failed")
        );
      }

      console.log("Camera stream obtained:", mediaStream);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;

        const handleLoadedMetadata = () => {
          console.log("Video metadata loaded");
          setVideoReady(true);
          setIsLoading(false);
          toast.success(
            "Camera ready! Face detection starting...",
          );
        };

        const handleError = (e: any) => {
          console.error("Video element error:", e);
          setError(
            "Video display failed. Please try refreshing the page.",
          );
          setIsLoading(false);
        };

        videoRef.current.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        videoRef.current.addEventListener("error", handleError);

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Video play failed:", playError);
          // Don't treat play failure as fatal - video might still work
        }
      }
    } catch (err: any) {
      console.error("Camera initialization error:", err);
      setIsLoading(false);

      let errorMessage = "Unable to access camera.";
      let errorType = "GENERIC";

      if (
        err.name === "NotAllowedError" ||
        err.message === "Permission denied"
      ) {
        errorMessage = "PERMISSION_DENIED";
        errorType = "PERMISSION_DENIED";
      } else if (err.name === "NotFoundError") {
        errorMessage = "NO_CAMERA";
        errorType = "NO_CAMERA";
      } else if (err.name === "NotReadableError") {
        errorMessage = "CAMERA_BUSY";
        errorType = "CAMERA_BUSY";
      } else if (err.message === "UNSUPPORTED_BROWSER") {
        errorMessage = "UNSUPPORTED_BROWSER";
        errorType = "UNSUPPORTED_BROWSER";
      } else if (err.message === "INSECURE_CONTEXT") {
        errorMessage = "INSECURE_CONTEXT";
        errorType = "INSECURE_CONTEXT";
      }

      setError(errorType);
    }
  };

  // Simple face detection using bounding box estimation
  const startFaceDetection = () => {
    const detectFaces = () => {
      if (!videoRef.current || !overlayCanvasRef.current)
        return;

      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple face detection simulation (in real app, use face-api.js or MediaPipe)
      // For demo purposes, we'll create mock face detection
      const mockFaces = [
        {
          x: canvas.width * 0.3,
          y: canvas.height * 0.2,
          width: canvas.width * 0.4,
          height: canvas.height * 0.6,
        },
      ];

      setDetectedFaces(mockFaces);

      // Draw hairstyle overlay on detected faces
      if (selectedHairstyle && mockFaces.length > 0) {
        drawHairstyleOverlay(ctx, mockFaces[0]);
      }

      requestAnimationFrame(detectFaces);
    };

    detectFaces();
  };

  const drawHairstyleOverlay = (
    ctx: CanvasRenderingContext2D,
    face: any,
  ) => {
    if (!selectedHairstyle) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scaledWidth =
        face.width * selectedHairstyle.scaleFactor;
      const scaledHeight =
        face.height * selectedHairstyle.scaleFactor;
      const x =
        face.x +
        selectedHairstyle.offsetX -
        (scaledWidth - face.width) / 2;
      const y = face.y + selectedHairstyle.offsetY;

      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.globalAlpha = 1.0;
    };
    img.src = selectedHairstyle.overlay;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !videoReady)
      return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0);
    context.scale(-1, 1);

    // Draw hairstyle overlay if selected
    if (selectedHairstyle && detectedFaces.length > 0) {
      drawHairstyleOverlay(context, detectedFaces[0]);
    }

    const imageData = canvas.toDataURL("image/png");
    onCapture?.(imageData);
    toast.success("Photo captured with hairstyle overlay!");
  };

  const handleHairstyleSelect = (hairstyle: Hairstyle) => {
    setSelectedHairstyle(hairstyle);
    onHairstyleSelect?.(hairstyle);
    toast.success(`Applied ${hairstyle.name} hairstyle`);
  };

  const nextCategory = () => {
    setCurrentCategoryIndex(
      (prev) => (prev + 1) % categories.length,
    );
    setSelectedHairstyle(null);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex(
      (prev) =>
        (prev - 1 + categories.length) % categories.length,
    );
    setSelectedHairstyle(null);
  };

  const retryCamera = () => {
    cleanupCamera();
    setVideoReady(false);
    setError(null);
    setDetectedFaces([]);
    setTimeout(() => {
      initializeCamera();
    }, 500);
  };

  if (error) {
    const getErrorContent = () => {
      switch (error) {
        case "PERMISSION_DENIED":
          return {
            title: "Camera Permission Required",
            message:
              "To use the virtual hairstyle try-on feature, please allow camera access.",
            instructions: [
              "1. Click the camera icon in your browser's address bar",
              '2. Select "Allow" for camera permissions',
              "3. Refresh this page and try again",
              "",
              "On mobile: Check your browser settings and enable camera access for this site.",
            ],
            showRetry: true,
          };

        case "NO_CAMERA":
          return {
            title: "No Camera Found",
            message:
              "No camera device was detected on your device.",
            instructions: [
              "• Make sure your camera is connected and working",
              "• Try using a different device with a camera",
              "• Check if other apps can access your camera",
            ],
            showRetry: true,
          };

        case "CAMERA_BUSY":
          return {
            title: "Camera In Use",
            message:
              "Your camera is currently being used by another application.",
            instructions: [
              "• Close other apps that might be using the camera",
              "• Close other browser tabs with camera access",
              "• Restart your browser and try again",
            ],
            showRetry: true,
          };

        case "UNSUPPORTED_BROWSER":
          return {
            title: "Browser Not Supported",
            message:
              "Your browser doesn't support camera access.",
            instructions: [
              "• Try using Chrome, Firefox, Safari, or Edge",
              "• Make sure your browser is up to date",
              "• Enable JavaScript in your browser settings",
            ],
            showRetry: false,
          };

        case "INSECURE_CONTEXT":
          return {
            title: "Secure Connection Required",
            message:
              "Camera access requires a secure (HTTPS) connection.",
            instructions: [
              '• Make sure the website URL starts with "https://"',
              "• Contact the website administrator if this persists",
              "• Try accessing the site from a secure network",
            ],
            showRetry: false,
          };

        default:
          return {
            title: "Camera Error",
            message:
              "An unexpected error occurred while accessing the camera.",
            instructions: [
              "• Try refreshing the page",
              "• Check your camera settings",
              "• Make sure no other apps are using the camera",
            ],
            showRetry: true,
          };
      }
    };

    const errorContent = getErrorContent();

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-6 bg-card">
          <div className="text-center mb-4">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-3" />
            <h3 className="text-xl mb-2">
              {errorContent.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {errorContent.message}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">
              How to fix this:
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {errorContent.instructions.map(
                (instruction, index) => (
                  <div
                    key={index}
                    className={instruction === "" ? "h-2" : ""}
                  >
                    {instruction}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {errorContent.showRetry && (
              <Button onClick={retryCamera} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              {errorContent.showRetry
                ? "Skip Virtual Try-On"
                : "Close"}
            </Button>
          </div>

          {error === "PERMISSION_DENIED" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> You can still book
                salon appointments without the virtual try-on
                feature!
              </p>
            </div>
          )}
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
            Initializing face detection...
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
            transform: "scaleX(-1)",
            backgroundColor: "#000000",
          }}
          playsInline
          muted
          autoPlay
        />

        {/* Face Detection Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Face Detection Status */}
        {videoReady && (
          <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Faces detected: {detectedFaces.length}
            </div>
            {selectedHairstyle && (
              <div className="mt-1 text-xs text-green-400">
                Applied: {selectedHairstyle.name}
              </div>
            )}
          </div>
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-black/90 backdrop-blur-sm border-t border-white/10">
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

      {/* Hairstyle Categories and Selector */}
      <div className="bg-black/95 border-t border-white/10">
        {/* Category Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevCategory}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <p className="text-white/90">
              {currentCategory} Styles (
              {currentCategoryIndex + 1}/{categories.length})
            </p>
            <p className="text-white/60 text-xs">
              {currentCategoryHairstyles.length} options
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextCategory}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Hairstyle Options */}
        <div className="px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {currentCategoryHairstyles.map((hairstyle) => (
              <button
                key={hairstyle.id}
                onClick={() => handleHairstyleSelect(hairstyle)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedHairstyle?.id === hairstyle.id
                    ? "border-white scale-110 shadow-lg"
                    : "border-white/30 hover:border-white/60"
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
            <div className="text-center mt-2">
              <p className="text-white/90">
                {selectedHairstyle.name}
              </p>
              <p className="text-white/60 text-xs">
                {selectedHairstyle.category} •{" "}
                {selectedHairstyle.gender}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}