import { useState, useEffect, useRef } from 'react';
import { Camera, Navigation, MapPin, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ARInstruction {
  type: 'turn' | 'straight' | 'destination' | 'landmark';
  direction: 'left' | 'right' | 'straight' | 'u-turn';
  distance: number;
  instruction: string;
  confidence: number;
  position: { x: number; y: number };
}

interface ARNavigationOverlayProps {
  isActive: boolean;
  currentLocation: [number, number];
  heading: number;
  instructions: ARInstruction[];
  onToggle: (active: boolean) => void;
}

export default function ARNavigationOverlay({
  isActive,
  currentLocation,
  heading,
  instructions,
  onToggle
}: ARNavigationOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission('granted');
        startCalibration();
      }
    } catch (error) {
      // Camera access denied
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);

    // Simulate calibration process
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const renderARInstructions = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render AR overlays for each instruction
    instructions.forEach((instruction, index) => {
      const { x, y } = instruction.position;
      
      // Draw instruction arrow
      ctx.save();
      ctx.translate(x, y);
      
      // Set style based on instruction type
      ctx.fillStyle = instruction.type === 'destination' ? '#00ff00' : '#0088ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;

      // Draw arrow based on direction
      drawARArrow(ctx, instruction.direction, instruction.distance);
      
      // Draw distance text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${instruction.distance}m`, 0, 50);
      
      ctx.restore();

      // Draw instruction text box
      drawInstructionBox(ctx, instruction, x, y + 70);
    });
  };

  const drawARArrow = (ctx: CanvasRenderingContext2D, direction: string, distance: number) => {
    const size = Math.max(30, Math.min(60, 100 - distance / 10));
    
    ctx.beginPath();
    
    switch (direction) {
      case 'left':
        // Left arrow
        ctx.moveTo(-size/2, 0);
        ctx.lineTo(size/4, -size/3);
        ctx.lineTo(size/4, -size/6);
        ctx.lineTo(size/2, -size/6);
        ctx.lineTo(size/2, size/6);
        ctx.lineTo(size/4, size/6);
        ctx.lineTo(size/4, size/3);
        ctx.closePath();
        break;
        
      case 'right':
        // Right arrow
        ctx.moveTo(size/2, 0);
        ctx.lineTo(-size/4, -size/3);
        ctx.lineTo(-size/4, -size/6);
        ctx.lineTo(-size/2, -size/6);
        ctx.lineTo(-size/2, size/6);
        ctx.lineTo(-size/4, size/6);
        ctx.lineTo(-size/4, size/3);
        ctx.closePath();
        break;
        
      case 'straight':
        // Up arrow
        ctx.moveTo(0, -size/2);
        ctx.lineTo(-size/3, size/4);
        ctx.lineTo(-size/6, size/4);
        ctx.lineTo(-size/6, size/2);
        ctx.lineTo(size/6, size/2);
        ctx.lineTo(size/6, size/4);
        ctx.lineTo(size/3, size/4);
        ctx.closePath();
        break;
        
      case 'u-turn':
        // U-turn arrow
        ctx.arc(0, 0, size/3, 0, Math.PI);
        ctx.lineTo(-size/3, -10);
        ctx.lineTo(-size/2, 0);
        ctx.lineTo(-size/3, 10);
        break;
    }
    
    ctx.fill();
    ctx.stroke();
  };

  const drawInstructionBox = (ctx: CanvasRenderingContext2D, instruction: ARInstruction, x: number, y: number) => {
    const text = instruction.instruction;
    const padding = 10;
    const fontSize = 14;
    
    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;
    
    // Draw background box
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(x - boxWidth/2, y, boxWidth, boxHeight);
    
    // Draw border
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - boxWidth/2, y, boxWidth, boxHeight);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + fontSize + padding/2);
    
    // Draw confidence indicator
    const confidenceWidth = boxWidth * (instruction.confidence / 100);
    ctx.fillStyle = instruction.confidence > 80 ? '#00ff00' : instruction.confidence > 60 ? '#ffff00' : '#ff8800';
    ctx.fillRect(x - boxWidth/2, y + boxHeight - 3, confidenceWidth, 3);
  };

  // Update AR overlays when video is playing
  useEffect(() => {
    if (isActive && !isCalibrating) {
      const interval = setInterval(renderARInstructions, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, isCalibrating, instructions]);

  if (cameraPermission === 'denied') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-red-800 mb-2">Camera Access Required</h3>
          <p className="text-red-600 mb-4">
            AR Navigation requires camera access to overlay directions on the real world.
          </p>
          <Button onClick={() => initializeCamera()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">AR Navigation</h3>
          <p className="text-muted-foreground mb-4">
            Experience next-generation navigation with augmented reality overlays
          </p>
          <Button onClick={() => onToggle(true)} className="bg-primary hover:bg-primary/90">
            <Zap className="w-4 h-4 mr-2" />
            Activate AR Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* AR Overlay Canvas */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Calibration Overlay */}
      {isCalibrating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Card className="bg-white/90">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-semibold mb-2">Calibrating AR System</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hold your device steady while we align the virtual world
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calibrationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {calibrationProgress}% complete
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* AR Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Badge variant="default" className="bg-green-500">
          <Camera className="w-3 h-3 mr-1" />
          AR Active
        </Badge>
        <Button
          onClick={() => onToggle(false)}
          variant="secondary"
          size="sm"
          className="bg-white/90 hover:bg-white"
        >
          Exit AR
        </Button>
      </div>
      
      {/* Compass Overlay */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/90 rounded-full p-3">
          <Navigation 
            className="w-6 h-6 text-primary"
            style={{ transform: `rotate(${heading}deg)` }}
          />
        </div>
      </div>
      
      {/* Speed and Location Info */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="opacity-70">Location:</span>
            <span className="ml-1">{currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}</span>
          </div>
          <div>
            <span className="opacity-70">Heading:</span>
            <span className="ml-1">{Math.round(heading)}°</span>
          </div>
        </div>
      </div>
      
      {/* Next Instruction Preview */}
      {instructions.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold">Next: {instructions[0].distance}m</span>
          </div>
          <p className="text-sm">{instructions[0].instruction}</p>
        </div>
      )}
    </div>
  );
}