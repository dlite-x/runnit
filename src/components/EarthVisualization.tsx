import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader, Vector3 } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Grid3X3, Plane } from 'lucide-react';
import earthTexture from '@/assets/earth-2k-texture.jpg';
import moonTexture from '@/assets/moon-texture-2k.jpg';

interface EarthProps {
  autoRotate: boolean;
  onEarthClick?: () => void;
}

interface MoonProps {
  autoRotate: boolean;
  onMoonClick?: () => void;
}

function Earth({ autoRotate, onEarthClick }: EarthProps) {
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
    <mesh 
      ref={earthRef} 
      position={[0, 0, 0]}
      onClick={onEarthClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = onEarthClick ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
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

function Moon({ autoRotate, onMoonClick }: MoonProps) {
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
    <mesh 
      ref={moonRef} 
      position={[24, 4, 8]}
      onClick={onMoonClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = onMoonClick ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
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
  selected?: boolean;
  onShipClick?: () => void;
}

function CapitalShip({ position, rotation, selected, onShipClick }: ShipProps) {
  const shipRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (shipRef.current) {
      shipRef.current.position.set(...position);
      shipRef.current.rotation.set(...rotation);
    }
  });

  return (
    <group ref={shipRef} rotation={[0, 0, -Math.PI / 2]}>
      {/* Main cylinder body */}
      <mesh 
        rotation={[0, 0, Math.PI / 2]}
        onClick={onShipClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onShipClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#87CEEB"} 
          metalness={0.6} 
          roughness={0.3}
          emissive={selected ? "#FFD700" : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Cone point at one end of the ship */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.4, 16]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#87CEEB"} 
          metalness={0.6} 
          roughness={0.3}
          emissive={selected ? "#FFD700" : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Silver loop around cylinder */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.8, 0.08, 8, 32]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#C0C0C0"} 
          metalness={0.9} 
          roughness={0.1}
          emissive={selected ? "#FFD700" : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
        />
      </mesh>

      {/* Diameter cylinder 1 (Y-axis) */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#C0C0C0"} 
          metalness={0.9} 
          roughness={0.1}
          emissive={selected ? "#FFD700" : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
        />
      </mesh>

      {/* Diameter cylinder 2 (Z-axis) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#C0C0C0"} 
          metalness={0.9} 
          roughness={0.1}
          emissive={selected ? "#FFD700" : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

function OrbitingShip({ moonPosition, index }: { moonPosition: [number, number, number]; index: number }) {
  const shipRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.LineSegments>(null);
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);
  
  useFrame((state, delta) => {
    if (shipRef.current) {
      const time = state.clock.getElapsedTime();
      const radius = 2 + index * 0.5; // Different orbital distances
      const speed = 0.5 + index * 0.2; // Faster speeds for more visible movement
      const phaseOffset = index * (Math.PI * 2 / 3); // Different starting positions
      
      // Calculate orbital position around moon
      const x = moonPosition[0] + Math.cos(time * speed + phaseOffset) * radius;
      const y = moonPosition[1] + Math.sin(time * speed + phaseOffset) * 0.3; // Slight vertical movement
      const z = moonPosition[2] + Math.sin(time * speed + phaseOffset) * radius;
      
      shipRef.current.position.set(x, y, z);
      
      // Point ship in direction of movement
      const nextAngle = time * speed + phaseOffset + 0.1;
      const nextX = moonPosition[0] + Math.cos(nextAngle) * radius;
      const nextZ = moonPosition[2] + Math.sin(nextAngle) * radius;
      shipRef.current.lookAt(nextX, y, nextZ);
      
      // Update trail
      const currentPos = new THREE.Vector3(x, y, z);
      setTrailPoints(prev => {
        const newPoints = [...prev, currentPos];
        // Keep only last 20 points for trail
        return newPoints.slice(-20);
      });
    }
  });

  // Create trail geometry
  React.useEffect(() => {
    if (trailRef.current && trailPoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
      trailRef.current.geometry.dispose();
      trailRef.current.geometry = geometry;
    }
  }, [trailPoints]);

  return (
    <group>
      {/* Ship */}
      <group ref={shipRef}>
        <mesh>
          <boxGeometry args={[0.1, 0.05, 0.15]} />
          <meshStandardMaterial 
            color={index === 0 ? "#FF6B6B" : index === 1 ? "#4ECDC4" : "#45B7D1"} 
            metalness={0.7} 
            roughness={0.2}
            emissive={index === 0 ? "#FF3333" : index === 1 ? "#33CCCC" : "#3399DD"}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Engine glow */}
        <mesh position={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.02, 0.04, 0.08, 8]} />
          <meshStandardMaterial 
            color="#FF8800" 
            emissive="#FF6600" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
      
      {/* Trail */}
      {trailPoints.length > 1 && (
        <lineSegments ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            color={index === 0 ? "#FF6B6B" : index === 1 ? "#4ECDC4" : "#45B7D1"} 
            transparent 
            opacity={0.6}
            linewidth={2}
          />
        </lineSegments>
      )}
    </group>
  );
}

function MoonBase() {
  const baseRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (baseRef.current) {
      // Subtle rotation to make it feel alive
      baseRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={baseRef} position={[11.2, 2.3, 3.2]}> {/* Positioned on bright side of moon */}
      {/* Main central hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Gold ring around hub */}
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.45, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={1.0} 
          roughness={0.05}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Communication towers */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Antenna dish */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.05, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Surrounding modules */}
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.6]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Gold connectors between modules */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Landing pads */}
      <mesh position={[1.2, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh position={[-1.2, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Warning lights */}
      <mesh position={[0.4, 0.3, 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000" 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[-0.4, 0.3, 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000" 
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function FighterDrones() {
  const dronesRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (dronesRef.current) {
      // Gentle rotation of the entire formation
      dronesRef.current.rotation.y += delta * 0.3;
}

function CoordinateSystem() {
  return (
    <group position={[12, 2, 4]}>
      {/* X-axis - Red */}
      <group>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        <mesh position={[2.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        {/* X label */}
        <mesh position={[2.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Y-axis - Green */}
      <group>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#00FF00" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#00FF00" />
        </mesh>
        {/* Y label */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Z-axis - Blue (pointing toward North Pole) */}
      <group>
        <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#0000FF" />
        </mesh>
        <mesh position={[0, 0, 2.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#0000FF" />
        </mesh>
        {/* Z label */}
        <mesh position={[0, 0, 2.8]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
  });

  // Create 5x5 matrix of yellow spheres
  const drones = [];
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      drones.push(
        <mesh 
          key={`drone-${x}-${z}`} 
          position={[
            (x - 2) * 0.3, // Center the formation
            0.2, 
            (z - 2) * 0.3
          ]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.7} 
            roughness={0.2}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
      );
    }
  }

  return (
    <group ref={dronesRef} position={[6, 1, 2]}>
      {drones}
    </group>
  );
}


function CoordinateSystem() {
  return (
    <group position={[12, 2, 4]}>
      {/* X-axis - Red */}
      <group>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        <mesh position={[2.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
        {/* X label */}
        <mesh position={[2.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Y-axis - Green */}
      <group>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#00FF00" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#00FF00" />
        </mesh>
        {/* Y label */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Z-axis - Blue (pointing toward North Pole) */}
      <group>
        <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#0000FF" />
        </mesh>
        <mesh position={[0, 0, 2.2]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.3, 8]} />
          <meshStandardMaterial color="#0000FF" />
        </mesh>
        {/* Z label */}
        <mesh position={[0, 0, 2.8]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
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
    
    // Debug logging
    if (keys.size > 0) {
      console.log('Keys pressed:', Array.from(keys));
    }
    
    let [vx, vy, vz] = velocity;
    let [rx, ry, rz] = rotation;
    
    // Create a rotation matrix from the ship's current rotation
    // Account for the ship's base rotation of [0, 0, -Math.PI / 2]
    const totalRx = rx;
    const totalRy = ry; 
    const totalRz = rz - Math.PI / 2; // Base rotation

    // Calculate direction vectors using proper rotation matrix
    // Forward direction (where the cone points) - positive X in ship's local space
    const forwardX = Math.cos(totalRy) * Math.cos(totalRz);
    const forwardY = Math.cos(totalRy) * Math.sin(totalRz);
    const forwardZ = -Math.sin(totalRy);

    // Right direction (perpendicular to forward)
    const rightX = -Math.sin(totalRz);
    const rightY = Math.cos(totalRz);
    const rightZ = 0;

    // Up direction (cross product of forward and right)
    const upX = Math.sin(totalRy) * Math.cos(totalRz);
    const upY = Math.sin(totalRy) * Math.sin(totalRz);
    const upZ = Math.cos(totalRy);

    // Movement controls using ship-relative directions
    if (keys.has('w')) {
      // Forward
      vx += forwardX * speed * delta;
      vy += forwardY * speed * delta;
      vz += forwardZ * speed * delta;
    }
    if (keys.has('s')) {
      // Backward
      vx -= forwardX * speed * delta;
      vy -= forwardY * speed * delta;
      vz -= forwardZ * speed * delta;
    }
    if (keys.has('a')) {
      // Left (negative right direction)
      vx -= rightX * speed * delta;
      vy -= rightY * speed * delta;
      vz -= rightZ * speed * delta;
    }
    if (keys.has('d')) {
      // Right
      vx += rightX * speed * delta;
      vy += rightY * speed * delta;
      vz += rightZ * speed * delta;
    }
    if (keys.has(' ')) {
      // Up
      vx += upX * speed * delta;
      vy += upY * speed * delta;
      vz += upZ * speed * delta;
    }
    if (keys.has('shift')) {
      // Down
      vx -= upX * speed * delta;
      vy -= upY * speed * delta;
      vz -= upZ * speed * delta;
    }
    
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
    
    // Debug logging for movement
    if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1 || Math.abs(vz) > 0.1) {
      console.log('Ship moving:', { position: newPosition, velocity: [vx, vy, vz] });
    }
    
    onPositionChange(newPosition);
    onRotationChange([rx, ry, rz]);
    onVelocityChange([vx, vy, vz]);
  });

  return null; // This component doesn't render anything
}

// CameraController component - follows ship in fly mode but allows rotation
const CameraController = ({ flyMode, shipPosition }: { flyMode: boolean; shipPosition: Vector3 }) => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());
  
  useFrame(() => {
    if (flyMode && shipPosition) {
      // Update the target position to the ship's position
      targetRef.current.copy(shipPosition);
      
      // Keep the camera at a relative distance from the ship
      // but allow OrbitControls to handle the rotation
      const currentDistance = camera.position.distanceTo(shipPosition);
      
      // If camera gets too far from ship, gently pull it back
      if (currentDistance > 10) {
        const direction = new Vector3().subVectors(shipPosition, camera.position).normalize();
        const targetPosition = new Vector3().copy(shipPosition).sub(direction.multiplyScalar(5));
        camera.position.lerp(targetPosition, 0.05);
      }
    }
  });

  return null;
};

// TargetMover component - handles ship movement to clicked destinations
const TargetMover = ({ 
  isMoving, 
  shipPosition, 
  targetPosition, 
  onPositionChange, 
  onMovementComplete 
}: {
  isMoving: boolean;
  shipPosition: [number, number, number];
  targetPosition: [number, number, number] | null;
  onPositionChange: (pos: [number, number, number]) => void;
  onMovementComplete: () => void;
}) => {
  useFrame(() => {
    if (isMoving && targetPosition) {
      const current = new Vector3(...shipPosition);
      const target = new Vector3(...targetPosition);
      
      // Calculate distance to target
      const distance = current.distanceTo(target);
      
      if (distance < 0.1) {
        // Arrived at target
        onMovementComplete();
        return;
      }
      
      // Move towards target
      const direction = target.clone().sub(current).normalize();
      const speed = Math.min(distance * 0.05, 0.1); // Adaptive speed
      const newPosition = current.add(direction.multiplyScalar(speed));
      
      onPositionChange([newPosition.x, newPosition.y, newPosition.z]);
    }
  });
  
  return null;
};

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
    const size = 60; // Increased from 30 to accommodate larger scene
    const divisions = 60; // Increased proportionally
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
  const [autoRotate, setAutoRotate] = useState(true); // Start with animation enabled
  const [showGrid, setShowGrid] = useState(false);
  const [flyMode, setFlyMode] = useState(false);
  const [fighterDronesBuilt, setFighterDronesBuilt] = useState(false);
  
  // Ship state
  const [shipPosition, setShipPosition] = useState<[number, number, number]>([12, 2, 4]);
  const [shipRotation, setShipRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [shipVelocity, setShipVelocity] = useState<[number, number, number]>([0, 0, 0]);
  const [shipSelected, setShipSelected] = useState(false);
  const [shipTarget, setShipTarget] = useState<[number, number, number] | null>(null);
  const [isMovingToTarget, setIsMovingToTarget] = useState(false);
  
  // Keyboard state
  const keysPressed = useRef<Set<string>>(new Set());

  // Click handlers
  const handleShipClick = () => {
    setShipSelected(true);
  };

  const handleEarthClick = () => {
    if (shipSelected) {
      setShipTarget([0, 3, 0]); // Position near Earth
      setIsMovingToTarget(true);
      setShipSelected(false);
    }
  };

  const handleMoonClick = () => {
    if (shipSelected) {
      setShipTarget([22, 4, 8]); // Position near Moon (updated for new distance)
      setIsMovingToTarget(true);
      setShipSelected(false);
    }
  };

  const handleMovementComplete = () => {
    setIsMovingToTarget(false);
    setShipTarget(null);
  };

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
              {flyMode ? 'Exit Flight' : 'Fly Capital Ship'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFighterDronesBuilt(!fighterDronesBuilt)}
              className="flex items-center gap-2"
            >
              {fighterDronesBuilt ? '🚁 Recall Drones' : '🚁 Build Fighter Drones'}
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
              <p className="mb-1">• RF: Pitch up/down</p>
              <p className="mb-1">• Click capital ship to select it</p>
              <p>• Click Earth/Moon to navigate</p>
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
        camera={{ position: [0, 0, 15], fov: 50 }}
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

        {/* Target Mover - handles automatic ship movement */}
        <TargetMover
          isMoving={isMovingToTarget}
          shipPosition={shipPosition}
          targetPosition={shipTarget}
          onPositionChange={setShipPosition}
          onMovementComplete={handleMovementComplete}
        />

        {/* Camera Controller - follows ship in fly mode */}
        <CameraController flyMode={flyMode} shipPosition={new Vector3(...shipPosition)} />

        {/* Earth, Moon, Ship, Orbiting Ships, Grid and Atmosphere */}
        <Earth autoRotate={autoRotate} onEarthClick={handleEarthClick} />
        <Moon autoRotate={autoRotate} onMoonClick={handleMoonClick} />
        {flyMode && (
          <CapitalShip 
            position={shipPosition} 
            rotation={shipRotation} 
            selected={shipSelected}
            onShipClick={handleShipClick}
          />
        )}
        
        {/* Orbiting ships around moon */}
        <OrbitingShip moonPosition={[24, 4, 8]} index={0} />
        <OrbitingShip moonPosition={[24, 4, 8]} index={1} />
        <OrbitingShip moonPosition={[24, 4, 8]} index={2} />
        
        {/* Coordinate System */}
        <CoordinateSystem />
        
        <Grid3D visible={showGrid} />
        <Atmosphere />
        
        {/* Fighter Drones */}
        {fighterDronesBuilt && <FighterDrones />}

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

        {/* Controls - now enabled in both modes with target following in fly mode */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={flyMode ? 40 : 30}
          dampingFactor={0.05}
          enableDamping={true}
          target={flyMode ? new Vector3(...shipPosition) : new Vector3(0, 0, 0)}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default EarthVisualization;
