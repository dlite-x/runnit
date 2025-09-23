import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Grid3X3, Plane } from 'lucide-react';
import earthTexture from '@/assets/earth-2k-texture.jpg';
import moonTexture from '@/assets/moon-texture-2k.jpg';

interface EarthProps {
  autoRotate: boolean;
}

function Earth({ autoRotate }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, earthTexture);
  
  // Configure texture for better appearance
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  useFrame((state, delta) => {
    if (earthRef.current && autoRotate) {
      earthRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.6}
        metalness={0.05}
        emissive="#111111"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function Moon({ autoRotate }: EarthProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, moonTexture);
  
  // Configure texture for better appearance
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  useFrame((state, delta) => {
    if (moonRef.current && autoRotate) {
      moonRef.current.rotation.y += delta * 0.05; // Slower rotation than Earth
    }
  });

  return (
    <mesh ref={moonRef} position={[12, 2, 4]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

interface ShipProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function Ship({ position, rotation }: ShipProps) {
  const shipRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (shipRef.current) {
      shipRef.current.position.set(...position);
      shipRef.current.rotation.set(...rotation);
    }
  });

  return (
    <group ref={shipRef}>
      {/* Main hull */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-0.3, 0, -0.1]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 0.2]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, 0, -0.1]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.6, 0.05, 0.2]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.05, 0.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#4A90E2" transparent opacity={0.8} />
      </mesh>
      
      {/* Engine glow */}
      <mesh position={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.08, 0.1, 8]} />
        <meshStandardMaterial 
          color="#FF4500" 
          emissive="#FF4500" 
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function ShipController({ 
  flyMode, 
  onPositionChange, 
  onRotationChange, 
  onVelocityChange,
  keysPressed 
}: {
  flyMode: boolean;
  onPositionChange: (pos: [number, number, number]) => void;
  onRotationChange: (rot: [number, number, number]) => void;
  onVelocityChange: (vel: [number, number, number]) => void;
  keysPressed: React.MutableRefObject<Set<string>>;
}) {
  const [position, setPosition] = useState<[number, number, number]>([5, 2, 3]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [velocity, setVelocity] = useState<[number, number, number]>([0, 0, 0]);

  useFrame((state, delta) => {
    if (!flyMode) return;

    const keys = keysPressed.current;
    const speed = 5;
    const rotationSpeed = 2;
    
    let [vx, vy, vz] = velocity;
    let [rx, ry, rz] = rotation;
    
    // Movement controls
    if (keys.has('w')) vz -= speed * delta; // Forward
    if (keys.has('s')) vz += speed * delta; // Backward
    if (keys.has('a')) vx -= speed * delta; // Left
    if (keys.has('d')) vx += speed * delta; // Right
    if (keys.has(' ')) vy += speed * delta; // Up
    if (keys.has('shift')) vy -= speed * delta; // Down
    
    // Rotation controls
    if (keys.has('q')) rz += rotationSpeed * delta; // Roll left
    if (keys.has('e')) rz -= rotationSpeed * delta; // Roll right
    if (keys.has('r')) rx += rotationSpeed * delta; // Pitch up
    if (keys.has('f')) rx -= rotationSpeed * delta; // Pitch down
    
    // Apply drag
    vx *= 0.95;
    vy *= 0.95;
    vz *= 0.95;
    
    // Update position
    const [px, py, pz] = position;
    const newPosition: [number, number, number] = [
      px + vx * delta,
      py + vy * delta,
      pz + vz * delta
    ];
    
    setPosition(newPosition);
    setVelocity([vx, vy, vz]);
    setRotation([rx, ry, rz]);
    
    onPositionChange(newPosition);
    onRotationChange([rx, ry, rz]);
    onVelocityChange([vx, vy, vz]);
  });

  return null; // This component doesn't render anything
}

function SpaceStation({ autoRotate }: EarthProps) {
  const stationRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (stationRef.current && autoRotate) {
      stationRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={stationRef} position={[5.1, 0.85, 1.7]}>
      {/* Main hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Communication dish */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#F0F0F0" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Docking port */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

interface GridProps {
  visible: boolean;
}

function Grid3D({ visible }: GridProps) {
  if (!visible) return null;

  const gridRef = useRef<THREE.LineSegments>(null);
  
  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.computeLineDistances();
    }
  }, [visible]);
  
  const createGridGeometry = () => {
    const size = 30;
    const divisions = 30;
    const step = size / divisions;
    const halfSize = size / 2;
    
    const vertices = [];
    
    // Create grid lines on XY plane (z = 0)
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      
      // Horizontal lines
      vertices.push(-halfSize, pos, 0, halfSize, pos, 0);
      // Vertical lines
      vertices.push(pos, -halfSize, 0, pos, halfSize, 0);
    }
    
    // Create grid lines on XZ plane (y = 0)
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      
      // Lines parallel to X axis
      vertices.push(-halfSize, 0, pos, halfSize, 0, pos);
      // Lines parallel to Z axis
      vertices.push(pos, 0, -halfSize, pos, 0, halfSize);
    }
    
    // Create grid lines on YZ plane (x = 0)
    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      
      // Lines parallel to Y axis
      vertices.push(0, -halfSize, pos, 0, halfSize, pos);
      // Lines parallel to Z axis
      vertices.push(0, pos, -halfSize, 0, pos, halfSize);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  };

  const geometry = createGridGeometry();

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <lineSegments ref={gridRef} geometry={geometry}>
        <lineDashedMaterial
          color="#00ff00"
          dashSize={0.5}
          gapSize={0.25}
          opacity={0.4}
          transparent={true}
        />
      </lineSegments>
    </group>
  );
}

function Atmosphere() {
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={atmosphereRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.05, 64, 64]} />
      <meshStandardMaterial
        color="#87CEEB"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

const EarthVisualization = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [flyMode, setFlyMode] = useState(false);
  
  // Ship state
  const [shipPosition, setShipPosition] = useState<[number, number, number]>([5, 2, 3]);
  const [shipRotation, setShipRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [shipVelocity, setShipVelocity] = useState<[number, number, number]>([0, 0, 0]);
  
  // Keyboard state
  const keysPressed = useRef<Set<string>>(new Set());

  // Flight controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleReset = () => {
    // Reset will be handled by makeDefault OrbitControls
    window.location.reload();
  };

  const handleZoomIn = () => {
    // Zoom functionality will be available via mouse/scroll
    console.log('Use scroll wheel to zoom in');
  };

  const handleZoomOut = () => {
    // Zoom functionality will be available via mouse/scroll  
    console.log('Use scroll wheel to zoom out');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Controls Panel */}
      <div className="absolute top-6 left-6 z-10 space-surface rounded-xl p-4 border border-border cosmic-glow">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground mb-2">Earth Controls</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
              className="flex items-center gap-2"
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoRotate ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="flex items-center gap-2"
            >
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="flex items-center gap-2"
            >
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFlyMode(!flyMode)}
              className="flex items-center gap-2"
            >
              <Plane className="w-4 h-4" />
              {flyMode ? 'Exit Flight' : 'Fly Ship'}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-6 left-6 z-10 space-surface rounded-xl p-4 border border-border">
        <div className="text-sm text-muted-foreground">
          {flyMode ? (
            <>
              <p className="mb-1">🚀 Flight Mode Active</p>
              <p className="mb-1">• WASD: Move horizontally</p>
              <p className="mb-1">• Space/Shift: Up/Down</p>
              <p className="mb-1">• QE: Roll left/right</p>
              <p>• RF: Pitch up/down</p>
            </>
          ) : (
            <>
              <p className="mb-1">🌍 Interactive Earth Visualization</p>
              <p className="mb-1">• Drag to rotate</p>
              <p className="mb-1">• Scroll to zoom</p>
              <p>• Use controls for precise navigation</p>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-6 right-6 z-10 text-right">
        <h1 className="text-4xl font-bold text-foreground mb-2 earth-glow">
          Planet Earth
        </h1>
        <p className="text-lg text-primary">3D Interactive Globe</p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        className="w-full h-full"
      >
        {/* Lighting - Increased brightness by 30% */}
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#4A90E2" />

        {/* Ship Controller */}
        <ShipController
          flyMode={flyMode}
          onPositionChange={setShipPosition}
          onRotationChange={setShipRotation}
          onVelocityChange={setShipVelocity}
          keysPressed={keysPressed}
        />

        {/* Earth, Moon, Space Station, Ship, Grid and Atmosphere */}
        <Earth autoRotate={autoRotate} />
        <Moon autoRotate={autoRotate} />
        <SpaceStation autoRotate={autoRotate} />
        {flyMode && <Ship position={shipPosition} rotation={shipRotation} />}
        <Grid3D visible={showGrid} />
        <Atmosphere />

        {/* Stars background */}
        <Stars
          radius={300}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade={true}
          speed={0}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          dampingFactor={0.05}
          enableDamping={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default EarthVisualization;