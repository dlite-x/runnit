import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';
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
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.8);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.8);
      controlsRef.current.update();
    }
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
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-6 left-6 z-10 space-surface rounded-xl p-4 border border-border">
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">🌍 Interactive Earth Visualization</p>
          <p className="mb-1">• Drag to rotate</p>
          <p className="mb-1">• Scroll to zoom</p>
          <p>• Use controls for precise navigation</p>
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

        {/* Earth, Moon, Space Station and Atmosphere */}
        <Earth autoRotate={autoRotate} />
        <Moon autoRotate={autoRotate} />
        <SpaceStation autoRotate={autoRotate} />
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
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
};

export default EarthVisualization;