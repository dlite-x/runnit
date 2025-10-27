import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import { TextureLoader, Vector3 } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Grid3X3, Plane, Users, Zap, Factory, Building, Coins, Gem, Hammer, Fuel, Battery, UtensilsCrossed, FlaskConical, Wheat, Pickaxe, Globe, Moon as MoonIcon, Satellite, Rocket, Home, Package, Archive, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import earthTexture from '@/assets/earth-2k-texture.jpg';
import moonTexture from '@/assets/moon-texture-2k.jpg';
import marsTexture from '@/assets/mars-texture-2k.jpg';
import ShipLaunchModal from './ShipLaunchModal';
import { useCredits } from '@/hooks/use-credits';
import { useBuildingLevels } from '@/hooks/use-building-levels';
import { usePlanetResources } from '@/hooks/use-planet-resources';

interface EarthProps {
  autoRotate: boolean;
  onEarthClick?: () => void;
  onEarthDoubleClick?: () => void;
}

interface MoonProps {
  autoRotate: boolean;
  onMoonClick?: () => void;
  onMoonDoubleClick?: () => void;
}

interface MarsProps {
  autoRotate: boolean;
  onMarsClick?: () => void;
  onMarsDoubleClick?: () => void;
}

function Earth({ autoRotate, onEarthClick, onEarthDoubleClick }: EarthProps) {
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
      onDoubleClick={onEarthDoubleClick}
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

function Moon({ autoRotate, onMoonClick, onMoonDoubleClick }: MoonProps) {
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
      onDoubleClick={onMoonDoubleClick}
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

function Mars({ autoRotate, onMarsClick, onMarsDoubleClick }: MarsProps) {
  const marsRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, marsTexture);
  
  // Configure texture for better appearance
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  useFrame((state, delta) => {
    if (marsRef.current && autoRotate) {
      marsRef.current.rotation.y += delta * 0.03; // Slower rotation
    }
  });

  return (
    <mesh 
      ref={marsRef} 
      position={[60, 10, 20]} // ~2.5x distance from Earth as Moon
      onClick={onMarsClick}
      onDoubleClick={onMarsDoubleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = onMarsClick ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <sphereGeometry args={[1.33, 64, 64]} /> {/* 2/3 of Earth's size (2 * 2/3 = 1.33) */}
      <meshStandardMaterial
        map={texture}
        roughness={0.95}
        metalness={0.05}
        emissive="#ff4400"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

// Selection Ring Component - shows around selected objects
function SelectionRing({ position, radius = 2.5, selected }: { 
  position: [number, number, number]; 
  radius?: number; 
  selected: boolean; 
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (selected && ringRef.current) {
      ringRef.current.rotation.z += delta * 2; // Spin selection ring
    }
  });

  if (!selected) return null;

  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[radius * 1.3, radius * 1.5, 32]} />
      <meshBasicMaterial 
        color="#4A90E2" 
        transparent 
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface ShipProps {
  position: [number, number, number];
  rotation: [number, number, number];
  selected?: boolean;
  onShipClick?: () => void;
  onShipDoubleClick?: () => void;
}

function CapitalShip({ position, rotation, selected, onShipClick, onShipDoubleClick }: ShipProps) {
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
        onDoubleClick={onShipDoubleClick}
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

// New StaticShip component for simplified movement system
function StaticShip({ 
  ship, 
  selected, 
  onShipClick, 
  onShipDoubleClick 
}: { 
  ship: { 
    type: 'colony' | 'cargo';
    name: string;
    location: 'earth' | 'moon' | 'mars' | 'eml1' | 'preparing' | 'traveling';
    staticPosition?: [number, number, number];
    travelProgress?: number;
    startPosition?: [number, number, number];
    endPosition?: [number, number, number];
    departureTime?: number;
    totalTravelTime?: number;
  };
  selected: boolean;
  onShipClick?: () => void;
  onShipDoubleClick?: () => void;
}) {
  const shipRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.LineSegments>(null);
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);

  // Calculate ship position based on travel state
  const currentPosition = React.useMemo(() => {
    console.log(`StaticShip ${ship.name}: location=${ship.location}, hasStartPos=${!!ship.startPosition}, hasEndPos=${!!ship.endPosition}, hasDepartureTime=${!!ship.departureTime}, hasTotalTime=${!!ship.totalTravelTime}`);
    
    if (ship.location === 'traveling' && ship.startPosition && ship.endPosition && ship.departureTime && ship.totalTravelTime) {
      const elapsed = Date.now() - ship.departureTime;
      const progress = Math.min(elapsed / (ship.totalTravelTime * 1000), 1);
      
      console.log(`${ship.name} traveling progress: ${Math.floor(progress * 100)}%`);
      
      // Bezier curve for smooth trajectory
      const t = progress;
      const start = ship.startPosition;
      const end = ship.endPosition;
      
      // Calculate smooth trajectory with proper arc
      const distance = Math.sqrt(
        Math.pow(end[0] - start[0], 2) + 
        Math.pow(end[1] - start[1], 2) + 
        Math.pow(end[2] - start[2], 2)
      );
      
      // Create an arc that goes up and curves naturally
      const arcHeight = distance * 0.6; // Higher arc for more dramatic trajectory
      const midY = Math.max(start[1], end[1]) + arcHeight;
      
      // Add slight offset to X and Z for more natural curve
      const directionX = (end[0] - start[0]) * 0.3;
      const directionZ = (end[2] - start[2]) * 0.3;
      
      const mid: [number, number, number] = [
        (start[0] + end[0]) / 2 + directionX * Math.sin(Math.PI * 0.5),
        midY,
        (start[2] + end[2]) / 2 + directionZ * Math.sin(Math.PI * 0.5)
      ];
      
      // Smooth easing for more natural acceleration/deceleration
      const easeT = t < 0.5 
        ? 2 * t * t 
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      // Quadratic Bezier interpolation with easing
      const x = (1 - easeT) * (1 - easeT) * start[0] + 2 * (1 - easeT) * easeT * mid[0] + easeT * easeT * end[0];
      const y = (1 - easeT) * (1 - easeT) * start[1] + 2 * (1 - easeT) * easeT * mid[1] + easeT * easeT * end[1];
      const z = (1 - easeT) * (1 - easeT) * start[2] + 2 * (1 - easeT) * easeT * mid[2] + easeT * easeT * end[2];
      
      const currentPos = [x, y, z] as [number, number, number];
      
      console.log(`${ship.name} current traveling position:`, currentPos);
      
      return currentPos;
    }
    
    console.log(`${ship.name} using static position:`, ship.staticPosition);
    return ship.staticPosition || [0, 0, 0];
  }, [ship.location, ship.startPosition, ship.endPosition, ship.departureTime, ship.totalTravelTime, ship.staticPosition, ship.name]);

  // Use useFrame for continuous position updates during travel
  useFrame(() => {
    if (shipRef.current) {
      let position = currentPosition;
      
      // Recalculate position for traveling ships to ensure smooth animation
      if (ship.location === 'traveling' && ship.startPosition && ship.endPosition && ship.departureTime && ship.totalTravelTime) {
        const elapsed = Date.now() - ship.departureTime;
        const progress = Math.min(elapsed / (ship.totalTravelTime * 1000), 1);
        
        const t = progress;
        const start = ship.startPosition;
        const end = ship.endPosition;
        
        const distance = Math.sqrt(
          Math.pow(end[0] - start[0], 2) + 
          Math.pow(end[1] - start[1], 2) + 
          Math.pow(end[2] - start[2], 2)
        );
        
        const arcHeight = distance * 0.6;
        const midY = Math.max(start[1], end[1]) + arcHeight;
        
        const directionX = (end[0] - start[0]) * 0.3;
        const directionZ = (end[2] - start[2]) * 0.3;
        
        const mid: [number, number, number] = [
          (start[0] + end[0]) / 2 + directionX * Math.sin(Math.PI * 0.5),
          midY,
          (start[2] + end[2]) / 2 + directionZ * Math.sin(Math.PI * 0.5)
        ];
        
        const easeT = t < 0.5 
          ? 2 * t * t 
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        const x = (1 - easeT) * (1 - easeT) * start[0] + 2 * (1 - easeT) * easeT * mid[0] + easeT * easeT * end[0];
        const y = (1 - easeT) * (1 - easeT) * start[1] + 2 * (1 - easeT) * easeT * mid[1] + easeT * easeT * end[1];
        const z = (1 - easeT) * (1 - easeT) * start[2] + 2 * (1 - easeT) * easeT * mid[2] + easeT * easeT * end[2];
        
        position = [x, y, z] as [number, number, number];
      }
      
      shipRef.current.position.set(position[0], position[1], position[2]);
      
      // Update trail for traveling ships
      if (ship.location === 'traveling') {
        const currentPos = new THREE.Vector3(...position);
        setTrailPoints(prev => {
          const newPoints = [...prev, currentPos];
          // Keep trail length manageable
          return newPoints.length > 50 ? newPoints.slice(-50) : newPoints;
        });
      } else {
        // Clear trail when not traveling
        if (trailPoints.length > 0) {
          setTrailPoints([]);
        }
      }
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

  const shipColor = ship.type === 'colony' ? "#FF6B6B" : "#4ECDC4";

  return (
    <group>
      {/* Trail for traveling ships */}
      {ship.location === 'traveling' && trailPoints.length > 1 && (
        <lineSegments ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            color={shipColor} 
            transparent 
            opacity={0.6}
            linewidth={2}
          />
        </lineSegments>
      )}
      
      {/* Ship */}
      <group ref={shipRef}>
        <mesh
          onClick={onShipClick}
          onDoubleClick={onShipDoubleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = onShipClick ? 'pointer' : 'default';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[0.15, 0.08, 0.2]} />
          <meshStandardMaterial 
            color={selected ? "#FFD700" : shipColor} 
            metalness={0.7} 
            roughness={0.2}
            emissive={selected ? "#FFD700" : shipColor}
            emissiveIntensity={selected ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* Engine glow */}
        <mesh position={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.03, 0.05, 0.1, 8]} />
          <meshStandardMaterial 
            color="#FF8800" 
            emissive="#FF6600" 
            emissiveIntensity={ship.location === 'traveling' ? 0.8 : 0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Ship Name Label - Simple approach with HTML */}
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
            {ship.name}
          </div>
        </Html>
        
        {/* Selection indicator */}
        {selected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial 
              color="#FFD700" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}
      </group>
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

function TrajectoryShip({ earthPosition, moonPosition }: { 
  earthPosition: [number, number, number]; 
  moonPosition: [number, number, number]; 
}) {
  const shipRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.LineSegments>(null);
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);
  
  useFrame((state, delta) => {
    if (shipRef.current) {
      const time = state.clock.getElapsedTime();
      const speed = 0.126; // 40% slower for more elegant trajectory
      
      // Figure-8 trajectory that loops around Earth and Moon
      const t = time * speed;
      
      // Calculate distance between Earth and Moon
      const earthToMoon = {
        x: moonPosition[0] - earthPosition[0],
        y: moonPosition[1] - earthPosition[1],
        z: moonPosition[2] - earthPosition[2]
      };
      
      // Center point for the figure-8 (slightly closer to Earth)
      const centerX = earthPosition[0] + earthToMoon.x * 0.4;
      const centerY = earthPosition[1] + earthToMoon.y * 0.4;
      const centerZ = earthPosition[2] + earthToMoon.z * 0.4;
      
      // Figure-8 parameters - larger to encompass both bodies
      const a = 15; // Width to reach around both Earth and Moon
      const b = 8;  // Height for proper looping
      
      // Parametric equations for figure-8 (lemniscate)
      const x = centerX + (a * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const y = centerY + (b * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const z = centerZ + Math.sin(t * 0.3) * 3; // Gentle vertical oscillation
      
      shipRef.current.position.set(x, y, z);
      
      // Point ship in direction of movement
      const nextT = t + 0.1;
      const nextX = centerX + (a * Math.cos(nextT)) / (1 + Math.sin(nextT) * Math.sin(nextT));
      const nextY = centerY + (b * Math.sin(nextT) * Math.cos(nextT)) / (1 + Math.sin(nextT) * Math.sin(nextT));
      const nextZ = centerZ + Math.sin(nextT * 0.3) * 3;
      shipRef.current.lookAt(nextX, nextY, nextZ);
      
      // Update trail
      const currentPos = new THREE.Vector3(x, y, z);
      setTrailPoints(prev => {
        const newPoints = [...prev, currentPos];
        // Keep longer trail for figure-8 visibility
        return newPoints.slice(-30);
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
          <boxGeometry args={[0.15, 0.08, 0.2]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.7} 
            roughness={0.2}
            emissive="#FFA500"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Engine glow */}
        <mesh position={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.03, 0.05, 0.1, 8]} />
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
            color="#FFD700" 
            transparent 
            opacity={0.8}
            linewidth={3}
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

function FighterDrones({ onDroneDestroyed, alienShipPosition, cubeAlive, onAlienHit }: { 
  onDroneDestroyed?: (droneId: string) => void;
  alienShipPosition?: [number, number, number];
  cubeAlive: boolean;
  onAlienHit?: () => void;
}) {
  const dronesRef = useRef<THREE.Group>(null);
  const [droneProjectiles, setDroneProjectiles] = useState<Array<{
    id: string;
    position: [number, number, number];
    direction: [number, number, number];
    shooterId: string;
  }>>([]);
  const lastShotTimes = useRef<Map<string, number>>(new Map());
  
  useFrame((state, delta) => {
    if (dronesRef.current) {
      // Gentle rotation of the entire formation
      dronesRef.current.rotation.y += delta * 0.3;
      
      // Drone shooting logic
      if (cubeAlive && alienShipPosition) {
        const time = state.clock.getElapsedTime();
        
        // Each drone shoots every 2 seconds at the alien ship
        for (let i = 0; i < 3; i++) {
          const droneId = `drone-${i}`;
          const lastShot = lastShotTimes.current.get(droneId) || 0;
          
          if (time - lastShot > 2) {
            // Calculate drone world position
            const droneLocalPos = [
              (i - 1) * 0.5, // Space them out more
              0.2,
              0
            ];
            
            const droneWorldPos: [number, number, number] = [
              6 + droneLocalPos[0] * Math.cos(dronesRef.current.rotation.y) - droneLocalPos[2] * Math.sin(dronesRef.current.rotation.y),
              1 + droneLocalPos[1],
              2 + droneLocalPos[0] * Math.sin(dronesRef.current.rotation.y) + droneLocalPos[2] * Math.cos(dronesRef.current.rotation.y)
            ];
            
            // Calculate direction to alien ship
            const dx = alienShipPosition[0] - droneWorldPos[0];
            const dy = alienShipPosition[1] - droneWorldPos[1];
            const dz = alienShipPosition[2] - droneWorldPos[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance > 0) {
              const direction: [number, number, number] = [dx / distance, dy / distance, dz / distance];
              const projectileId = `drone-projectile-${Date.now()}-${droneId}`;
              
              setDroneProjectiles(prev => [...prev, {
                id: projectileId,
                position: [...droneWorldPos],
                direction,
                shooterId: droneId
              }]);
              
              lastShotTimes.current.set(droneId, time);
            }
          }
        }
      }
    }
  });

  const handleDroneProjectileHit = (projectileId: string) => {
    setDroneProjectiles(prev => prev.filter(p => p.id !== projectileId));
  };

  // Create 3 fighter drones in a line formation
  const drones = [];
  for (let i = 0; i < 3; i++) {
    const droneId = `drone-${i}`;
    drones.push(
      <mesh 
        key={droneId}
        name={droneId}
        position={[
          (i - 1) * 0.5, // Space them out horizontally: -0.5, 0, 0.5
          0.2, 
          0
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

  return (
    <>
      <group ref={dronesRef} position={[6, 1, 2]}>
        {drones}
      </group>
      
      {/* Render drone projectiles */}
      {droneProjectiles.map(projectile => (
        <DroneProjectile
          key={projectile.id}
          position={projectile.position}
          direction={projectile.direction}
          onHit={handleDroneProjectileHit}
          alienShipPosition={alienShipPosition}
          onAlienHit={onAlienHit}
        />
      ))}
    </>
  );
}

// Drone Projectile component
function DroneProjectile({ position, direction, onHit, alienShipPosition, onAlienHit }: {
  position: [number, number, number];
  direction: [number, number, number];
  onHit: (projectileId: string) => void;
  alienShipPosition?: [number, number, number];
  onAlienHit?: () => void;
}) {
  const projectileRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const projectileId = useRef(`drone-projectile-${Math.random()}`);

  useFrame(() => {
    if (projectileRef.current) {
      const speed = 8;
      const elapsed = (Date.now() - startTime.current) / 1000;
      
      // Move projectile
      const newPos: [number, number, number] = [
        position[0] + direction[0] * speed * elapsed,
        position[1] + direction[1] * speed * elapsed,
        position[2] + direction[2] * speed * elapsed
      ];
      
      projectileRef.current.position.set(...newPos);

      // Check collision with alien ship
      if (alienShipPosition) {
        const distance = Math.sqrt(
          Math.pow(newPos[0] - alienShipPosition[0], 2) +
          Math.pow(newPos[1] - alienShipPosition[1], 2) +
          Math.pow(newPos[2] - alienShipPosition[2], 2)
        );
        
        if (distance < 0.5) { // Hit the alien ship
          onAlienHit?.();
          onHit(projectileId.current);
          return;
        }
      }

      // Remove projectile after 4 seconds
      if (elapsed > 4) {
        onHit(projectileId.current);
      }
    }
  });

  return (
    <mesh ref={projectileRef} position={position}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial 
        color="#00FF00" 
        emissive="#00FF00" 
        emissiveIntensity={0.9}
      />
    </mesh>
  );
}

// Projectile component
function Projectile({ position, direction, onHit, onCollision }: {
  position: [number, number, number];
  direction: [number, number, number];
  onHit: (projectileId: string) => void;
  onCollision?: (projectilePosition: [number, number, number]) => void;
}) {
  const projectileRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const projectileId = useRef(`projectile-${Math.random()}`);

  useFrame(() => {
    if (projectileRef.current) {
      const speed = 10;
      const elapsed = (Date.now() - startTime.current) / 1000;
      
      // Move projectile
      const newPos: [number, number, number] = [
        position[0] + direction[0] * speed * elapsed,
        position[1] + direction[1] * speed * elapsed,
        position[2] + direction[2] * speed * elapsed
      ];
      
      projectileRef.current.position.set(...newPos);

      // Check collision with target cube (rough collision detection)
      const cubePos = [6, 1, 2]; // Center of drone field
      const distance = Math.sqrt(
        Math.pow(newPos[0] - cubePos[0], 2) +
        Math.pow(newPos[1] - cubePos[1], 2) +
        Math.pow(newPos[2] - cubePos[2], 2)
      );
      
      if (distance < 0.3) { // Hit the cube
        onCollision?.(newPos);
        onHit(projectileId.current);
        return;
      }

      // Remove projectile after 3 seconds
      if (elapsed > 3) {
        onHit(projectileId.current);
      }
    }
  });

  return (
    <mesh ref={projectileRef} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial 
        color="#FF0000" 
        emissive="#FF0000" 
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

// Target Cube component
function TargetCube({ hitsTaken = 0, onCubeClick }: { hitsTaken?: number; onCubeClick?: () => void }) {
  const hitpoints = Math.max(0, 10 - hitsTaken);
  const cubeRef = useRef<THREE.Group>(null);
  
  const handleHit = () => {
    // This function is no longer needed since hits are managed externally
  };

  useFrame((state) => {
    if (cubeRef.current) {
      // Gentle floating animation
      cubeRef.current.position.y = 1.2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={cubeRef} position={[2.2, 0, 0]}>
      {/* Main cube */}
      <mesh 
        onClick={onCubeClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onCubeClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={hitpoints > 0 ? "#00FF00" : "#FF0000"}
          metalness={0.6} 
          roughness={0.3}
          emissive={hitpoints > 0 ? "#00FF00" : "#FF0000"}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Hitpoint display */}
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Text would go here - for now we'll use a simple indicator */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color={hitpoints > 0 ? "#FFFFFF" : "#000000"}
          emissive={hitpoints > 0 ? "#FFFFFF" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* HP Bar visualization */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            -0.35 + (i * 0.07), 
            0.4, 
            0.01
          ]}
        >
          <boxGeometry args={[0.05, 0.1, 0.01]} />
          <meshStandardMaterial 
            color={i < hitpoints ? "#00FF00" : "#FF0000"}
            emissive={i < hitpoints ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Status text indicator - "DEAD" when destroyed */}
      {hitpoints === 0 && (
        <>
          {/* Dead indicator sphere */}
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color="#FF0000" 
              emissive="#FF0000" 
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* "DEAD" text representation using small cubes */}
          {/* D */}
          <mesh position={[-0.3, -0.6, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.01]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
          </mesh>
          {/* E */}
          <mesh position={[-0.1, -0.6, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.01]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
          </mesh>
          {/* A */}
          <mesh position={[0.1, -0.6, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.01]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
          </mesh>
          {/* D */}
          <mesh position={[0.3, -0.6, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.01]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Base Cube component - appears on moon surface
function BaseCube({ onCubeClick }: { onCubeClick?: () => void }) {
  const cubeRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cubeRef.current) {
      // Gentle floating animation
      cubeRef.current.position.y = 4.8 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group ref={cubeRef} position={[24, 4.8, 8]}> {/* Moon position + surface offset */}
      {/* Main base cube */}
      <mesh 
        onClick={onCubeClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onCubeClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial 
          color="#00FF00"
          metalness={0.3} 
          roughness={0.4}
          emissive="#00FF00"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Base foundation */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.02, 8]} />
        <meshStandardMaterial 
          color="#006600"
          metalness={0.5} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Small antenna/beacon on top */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.02, 8]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Blinking light on antenna */}
      <mesh position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshStandardMaterial 
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

// Space Station Component - orbits Earth
function SpaceStation({ onSpaceStationDoubleClick }: { onSpaceStationDoubleClick?: () => void }) {
  const stationRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (stationRef.current) {
      const time = state.clock.getElapsedTime();
      const radius = 4;
      stationRef.current.position.x = Math.cos(time * 0.3) * radius;
      stationRef.current.position.y = Math.sin(time * 0.3) * radius * 0.5;
      stationRef.current.position.z = Math.sin(time * 0.3) * radius;
      stationRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group ref={stationRef}>
      {/* Central hub */}
      <mesh
        onDoubleClick={onSpaceStationDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onSpaceStationDoubleClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#4169E1"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.05, 1.6]} />
        <meshStandardMaterial 
          color="#003366" 
          metalness={0.1} 
          roughness={0.9}
          emissive="#0066CC"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.05, 1.6]} />
        <meshStandardMaterial 
          color="#003366" 
          metalness={0.1} 
          roughness={0.9}
          emissive="#0066CC"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Communication array */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

// Ship Factory Component - static near Earth
function ShipFactory({ onShipFactoryDoubleClick }: { onShipFactoryDoubleClick?: () => void }) {
  const factoryRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (factoryRef.current) {
      // Gentle floating animation
      factoryRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={factoryRef} position={[3, 3, 2]}>
      {/* Main factory structure */}
      <mesh
        onDoubleClick={onShipFactoryDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onShipFactoryDoubleClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial 
          color="#444444" 
          metalness={0.7} 
          roughness={0.3}
          emissive="#FF6600"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Construction bays */}
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.8]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.5} 
          roughness={0.4}
        />
      </mesh>
      
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.8]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.5} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Factory lights */}
      <mesh position={[0, 0.5, 0.7]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh position={[0, 0.5, -0.7]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial 
          color="#00FF00" 
          emissive="#00FF00"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

// Ship Panel Drones - yellow spheres next to ship factory
function ShipPanelDrones({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[3 + (i % 3) * 0.3, 3.5 + Math.floor(i / 3) * 0.3, 2.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700"
            metalness={0.3} 
            roughness={0.4}
            emissive="#FFD700"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </>
  );
}

// Custom Ship Loader Component
function CustomShip({ position, rotation, selected, onShipClick, onShipDoubleClick }: ShipProps) {
  const shipRef = useRef<THREE.Group>(null);
  
  // For now, create a placeholder custom ship design
  // This will be replaced with OBJ/MTL loader once files are extracted
  
  useFrame(() => {
    if (shipRef.current) {
      shipRef.current.position.set(...position);
      shipRef.current.rotation.set(...rotation);
    }
  });

  return (
    <group ref={shipRef} rotation={[0, 0, 0]}>
      {/* Custom ship body - angular design */}
      <mesh 
        onClick={onShipClick}
        onDoubleClick={onShipDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = onShipClick ? 'pointer' : 'default';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <coneGeometry args={[0.2, 1.0, 8]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#4169E1"} 
          metalness={0.8} 
          roughness={0.2}
          emissive={selected ? "#FFD700" : "#4169E1"}
          emissiveIntensity={selected ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Ship wings */}
      <mesh position={[0, 0, 0.3]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial 
          color={selected ? "#FFD700" : "#4169E1"} 
          metalness={0.8} 
          roughness={0.2}
          emissive={selected ? "#FFD700" : "#4169E1"}
          emissiveIntensity={selected ? 0.2 : 0.05}
        />
      </mesh>
      
      {/* Selection indicator */}
      {selected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
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

// Alien Ship component
function AlienShip({ targetPosition, onTargetHit, onAlienHit, onPositionChange, alienShipHits, onAlienShipDoubleClick }: { 
  targetPosition: [number, number, number];
  onTargetHit: () => void;
  onAlienHit: () => void;
  onPositionChange?: (pos: [number, number, number]) => void;
  alienShipHits: number;
  onAlienShipDoubleClick?: () => void;
}) {
  const shipRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>([15, 5, 8]);
  const hitpoints = Math.max(0, 100 - alienShipHits); // Calculate hitpoints from hits taken
  const [lastHitTime, setLastHitTime] = useState(0);
  
  // Track when alien ship gets hit for visual feedback
  React.useEffect(() => {
    if (alienShipHits > 0) {
      setLastHitTime(Date.now());
    }
  }, [alienShipHits]);
  const [projectiles, setProjectiles] = useState<Array<{
    id: string;
    position: [number, number, number];
    direction: [number, number, number];
  }>>([]);
  const lastShotTime = useRef(0);

  useFrame((state) => {
    if (shipRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Move towards target
      const targetDistance = 8; // Keep some distance
      const dx = targetPosition[0] - position[0];
      const dy = targetPosition[1] - position[1];
      const dz = targetPosition[2] - position[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > targetDistance) {
        const moveSpeed = 2;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        const normalizedDz = dz / distance;
        
        const newPos: [number, number, number] = [
          position[0] + normalizedDx * moveSpeed * 0.016,
          position[1] + normalizedDy * moveSpeed * 0.016,
          position[2] + normalizedDz * moveSpeed * 0.016
        ];
        setPosition(newPos);
        onPositionChange?.(newPos);
      } else {
        // Still report position even when not moving
        onPositionChange?.(position);
      }
      
      // Point towards target
      shipRef.current.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
      
      // Shoot every 1.5 seconds when in range
      if (distance < 15 && time - lastShotTime.current > 1.5) {
        const direction: [number, number, number] = [dx / distance, dy / distance, dz / distance];
        const projectileId = `projectile-${Date.now()}`;
        
        setProjectiles(prev => [...prev, {
          id: projectileId,
          position: [...position],
          direction
        }]);
        
        lastShotTime.current = time;
      }
      
      shipRef.current.position.set(...position);
    }
  });

  const handleProjectileHit = (projectileId: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== projectileId));
  };

  const handleCollision = () => {
    onTargetHit();
  };

  return (
    <>
      <group ref={shipRef} position={position}>
        {/* Alien ship body - angular, menacing design */}
        <mesh
          onDoubleClick={onAlienShipDoubleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = onAlienShipDoubleClick ? 'pointer' : 'default';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <coneGeometry args={[0.3, 0.8, 6]} />
          <meshStandardMaterial 
            color={Date.now() - lastHitTime < 200 ? "#FF0000" : "#8B0000"} 
            metalness={0.8} 
            roughness={0.2}
            emissive={Date.now() - lastHitTime < 200 ? "#FF0000" : "#8B0000"}
            emissiveIntensity={Date.now() - lastHitTime < 200 ? 0.8 : 0.3}
          />
        </mesh>
        
        {/* Wings */}
        <mesh position={[0, 0, 0.2]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.1, 0.3]} />
          <meshStandardMaterial 
            color="#8B0000" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Engine glow */}
        <mesh position={[0, 0, -0.5]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#FF4500" 
            emissive="#FF4500" 
            emissiveIntensity={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Health Bar */}
        <group position={[0, 1, 0]}>
          {/* Health bar background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 0.2]} />
            <meshStandardMaterial 
              color="#444444" 
              transparent 
              opacity={0.8}
            />
          </mesh>
          
          {/* Health bar fill */}
          <mesh position={[-(1 - hitpoints/100), 0, 0.01]} scale={[hitpoints/100, 1, 1]}>
            <planeGeometry args={[2, 0.15]} />
            <meshStandardMaterial 
              color={hitpoints > 30 ? "#00FF00" : hitpoints > 10 ? "#FFFF00" : "#FF0000"}
              emissive={hitpoints > 30 ? "#00FF00" : hitpoints > 10 ? "#FFFF00" : "#FF0000"}
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Health text indicator */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={hitpoints > 0 ? "#FFFFFF" : "#FF0000"}
              emissive={hitpoints > 0 ? "#FFFFFF" : "#FF0000"}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>
      
      {/* Render projectiles */}
      {projectiles.map(projectile => (
        <Projectile
          key={projectile.id}
          position={projectile.position}
          direction={projectile.direction}
          onHit={handleProjectileHit}
          onCollision={handleCollision}
        />
      ))}
    </>
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

// OrbitingSphere component for ships orbiting Earth
const OrbitingSphere = ({ type, orbitRadius, orbitSpeed, initialAngle, name, location, sphereData, onLocationUpdate, onShipClick, onSphereUpdate }: {
  type: 'colony' | 'cargo';
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  name: string;
  location: 'earth' | 'moon' | 'preparing' | 'traveling';
  sphereData: { 
    type: 'colony' | 'cargo', 
    position: [number, number, number], 
    name: string, 
    location: 'earth' | 'moon' | 'preparing' | 'traveling',
    departureTime?: number,
    totalTravelTime?: number,
    destination?: string,
    cargo?: { metal: number, fuel: number, food: number }
  };
  onLocationUpdate: (name: string, newLocation: 'earth' | 'moon' | 'preparing' | 'traveling') => void;
  onShipClick?: (name: string, type: 'colony' | 'cargo') => void;
  onSphereUpdate?: (name: string, updates: any) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.LineSegments>(null);
  const [travelProgress, setTravelProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [trailPoints, setTrailPoints] = useState<THREE.Vector3[]>([]);
  const [launchPosition, setLaunchPosition] = useState<[number, number, number] | null>(null);
  
  useFrame((state) => {
    if (meshRef.current && textRef.current) {
      const time = state.clock.getElapsedTime();
      const angle = initialAngle + time * orbitSpeed;
      
      if (location === 'preparing') {
        // Continue orbiting until we reach a good launch position (facing the moon)
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const y = Math.sin(angle * 0.5) * 0.5;
        
        meshRef.current.position.set(x, y, z);
        textRef.current.position.set(x, y + 0.5, z);
        
        // Determine target direction based on current location and destination
        const destination = sphereData.destination || 'moon';
        let targetDirection: number;
        let targetCenter: [number, number, number];
        let currentPlanet: string;
        
        // Determine current planet and target destination
        if (location === 'preparing') {
          // Check if we're currently orbiting Earth or Moon
          if (orbitRadius < 10) { // Earth orbit
            currentPlanet = 'earth';
            if (destination === 'earth') {
              // Already at Earth, don't launch
              return;
            }
            targetCenter = destination === 'moon' ? [24, 4, 8] : [24, 4, 8]; // Default to moon for now
            targetDirection = Math.atan2(targetCenter[2], targetCenter[0]);
          } else { // Moon orbit
            currentPlanet = 'moon';
            if (destination === 'moon') {
              // Already at Moon, don't launch
              return;
            }
            targetCenter = destination === 'earth' ? [0, 0, 0] : [0, 0, 0]; // Default to earth for now
            targetDirection = Math.atan2(targetCenter[2] - 8, targetCenter[0] - 24); // From moon position to target
          }
        }
        
        const velocityDirection = (angle + Math.PI / 2) % (Math.PI * 2); // Orbital velocity is perpendicular to radius
        const directionDiff = Math.abs(velocityDirection - targetDirection);
        const normalizedDiff = Math.min(directionDiff, 2 * Math.PI - directionDiff);
        
        if (normalizedDiff < Math.PI / 9) { // π/9 = 20 degrees
          setLaunchPosition([x, y, z]);
          const travelTimeSeconds = calculateTravelTimeSeconds(currentPlanet, destination);
          
          // Update with departure time and travel details
          onLocationUpdate(name, 'traveling');
          
          // Also update the sphere data with timing info
          onSphereUpdate?.(name, {
            location: 'traveling',
            departureTime: Date.now(),
            totalTravelTime: travelTimeSeconds,
            destination
          });
        }
      } else if (location === 'traveling') {
        // Dynamic travel animation based on destination
        const destination = sphereData.destination || 'moon';
        let targetCenter: [number, number, number];
        
        // Determine target coordinates based on destination
        if (destination === 'earth') {
          targetCenter = [0, 0, 0];
        } else if (destination === 'moon') {
          targetCenter = [24, 4, 8];
        } else {
          // Default to moon for other destinations
          targetCenter = [24, 4, 8];
        }
        
        const travelSpeed = 0.15; // Much slower, similar to figure-8 ship speed
        
        if (travelProgress < 1 && launchPosition) {
          const newProgress = Math.min(1, travelProgress + travelSpeed * 0.016); // ~60fps
          setTravelProgress(newProgress);
          
          const x = launchPosition[0] + (targetCenter[0] - launchPosition[0]) * newProgress;
          const y = launchPosition[1] + (targetCenter[1] - launchPosition[1]) * newProgress;
          const z = launchPosition[2] + (targetCenter[2] - launchPosition[2]) * newProgress;
          
          meshRef.current.position.set(x, y, z);
          textRef.current.position.set(x, y + 0.5, z);
          
          // Add trail points during travel
          const currentPos = new THREE.Vector3(x, y, z);
          setTrailPoints(prev => {
            const newPoints = [...prev, currentPos];
            // Keep trail for the journey
            return newPoints.slice(-25);
          });
        } else if (travelProgress >= 1) {
          // Travel complete, update location to destination
          const finalLocation = destination === 'earth' ? 'earth' : 'moon';
          onLocationUpdate(name, finalLocation as any);
          setTravelProgress(0);
          setLaunchPosition(null);
          // Clear trail when travel is complete
          setTrailPoints([]);
        }
      } else {
        // Normal orbit logic - clear trail when not traveling
        if (trailPoints.length > 0) {
          setTrailPoints([]);
        }
        
        let centerX = 0, centerY = 0, centerZ = 0;
        
        if (location === 'moon') {
          centerX = 24;
          centerY = 4;
          centerZ = 8;
        }
        
        const x = centerX + Math.cos(angle) * orbitRadius;
        const z = centerZ + Math.sin(angle) * orbitRadius;
        const y = centerY + Math.sin(angle * 0.5) * 0.5;
        
        meshRef.current.position.set(x, y, z);
        textRef.current.position.set(x, y + 0.5, z);
      }
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
      <mesh 
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onShipClick?.(name, type);
        }}
      >
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color={type === 'colony' ? '#3b82f6' : '#f59e0b'} />
      </mesh>
      {/* Text label for the sphere */}
      <group ref={textRef}>
        <Text
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
      
      {/* Trail - only visible during travel */}
      {location === 'traveling' && trailPoints.length > 1 && (
        <lineSegments ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial 
            color={type === 'colony' ? '#3b82f6' : '#f59e0b'} 
            transparent 
            opacity={0.8}
            linewidth={2}
          />
        </lineSegments>
      )}
    </group>
  );
}


// CameraController component - follows ship in fly mode but allows rotation
const CameraController = ({ flyMode, shipPosition, cameraTarget }: { 
  flyMode: boolean; 
  shipPosition: Vector3;
  cameraTarget: [number, number, number];
}) => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());
  const lastCameraTarget = useRef<[number, number, number]>([12, 2, 4]);
  
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
    } else {
      // Camera target changes are tracked but camera position is not automatically moved
      // This allows OrbitControls target to update without repositioning the camera
      const [x, y, z] = cameraTarget;
      const [lastX, lastY, lastZ] = lastCameraTarget.current;
      
      // Just update the last target reference without moving the camera
      if (x !== lastX || y !== lastY || z !== lastZ) {
        lastCameraTarget.current = [x, y, z];
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

// Travel time matrix in seconds for predefined routes
const TRAVEL_TIMES: Record<string, Record<string, number>> = {
  earth: {
    moon: 40,
    mars: 45,
    eml1: 12,
    offload: 4,   // Cargo operation
    land: 3,      // Landing operation
    colonize: 8   // Colony setup
  },
  moon: {
    earth: 6,
    mars: 50,
    eml1: 8,
    offload: 3,
    land: 2,
    colonize: 6
  },
  mars: {
    earth: 45,
    moon: 50,
    eml1: 35,
    offload: 5,
    land: 4,
    colonize: 12
  },
  eml1: {
    earth: 12,
    moon: 8,
    mars: 35,
    offload: 3,
    land: 2,
    colonize: 7
  }
};

// Calculate travel time in seconds based on predefined matrix or distance fallback
const calculateTravelTimeSeconds = (origin: string, destination: string): number => {
  // Check predefined travel times first
  const predefinedTime = TRAVEL_TIMES[origin]?.[destination];
  if (predefinedTime !== undefined) {
    return predefinedTime;
  }
  // Fallback to distance-based calculation for unknown routes
  const positions = {
    earth: [0, 0, 0],
    moon: [24, 4, 8],
    mars: [60, 10, 20],
    eml1: [16, 2.5, 5.3]
  };

  const originPos = positions[origin as keyof typeof positions] || positions.earth;
  const destPos = positions[destination as keyof typeof positions] || positions.moon;

  // Calculate 3D distance
  const dx = destPos[0] - originPos[0];
  const dy = destPos[1] - originPos[1]; 
  const dz = destPos[2] - originPos[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Use higher speed for fallback routes to keep times reasonable
  const speed = 4;
  return Math.round(distance / speed);
};

// Format time display
const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds < 60) {
    return `${timeInSeconds}s`;
  } else {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
};

// Countdown timer component for traveling ships
const CountdownTimer = ({ 
  departureTime, 
  totalTravelTime, 
  onArrival 
}: { 
  departureTime: number; 
  totalTravelTime: number; 
  onArrival: () => void; 
}) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = (Date.now() - departureTime) / 1000;
      const remaining = Math.max(0, totalTravelTime - elapsed);
      
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        onArrival();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [departureTime, totalTravelTime, onArrival]);

  return <span className="text-sm text-slate-300 italic">{formatTime(Math.ceil(remainingTime))}</span>;
};

const EarthVisualization = () => {
  const { credits, spendCredits } = useCredits(); // Hook for auto-incrementing credits
  const [autoRotate, setAutoRotate] = useState(true); // Start with animation enabled
  const [showGrid, setShowGrid] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [gameTime, setGameTime] = useState(0); // Game time in seconds
  const [flyMode, setFlyMode] = useState(false);
  const [fighterDronesBuilt, setFighterDronesBuilt] = useState(false);
  const [alienShipActive, setAlienShipActive] = useState(false);
  const [targetCubeHits, setTargetCubeHits] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('');
  const [alienShipHits, setAlienShipHits] = useState(0);
  const [builtSpheres, setBuiltSpheres] = useState<Array<{ 
    type: 'colony' | 'cargo', 
    position?: [number, number, number], // Optional for legacy spheres
    name: string, 
    location: 'earth' | 'moon' | 'mars' | 'eml1' | 'preparing' | 'traveling',
    departureTime?: number,
    totalTravelTime?: number,
    destination?: string,
    cargo?: { metal: number, fuel: number, food: number },
    // New fields for static positioning
    staticPosition?: [number, number, number],
    travelProgress?: number,
    startPosition?: [number, number, number],
    endPosition?: [number, number, number]
  }>>([]);

  // Helper functions for static positioning
  const getStaticPositionNearPlanet = (planet: 'earth' | 'moon' | 'mars' | 'eml1', index: number): [number, number, number] => {
    if (planet === 'earth') {
      // Position ships around Earth in a wider formation
      const angle = (index * Math.PI * 2) / 6; // 6 ships per ring
      const ring = Math.floor(index / 6); // Multiple rings if more than 6 ships
      const radius = 5 + ring * 2; // Increase radius for each ring
      const height = Math.sin(angle) * 1.5 + ring * 0.8; // Vary height
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    } else if (planet === 'moon') {
      // Position ships around Moon in formation
      const moonBase = [24, 4, 8];
      const angle = (index * Math.PI * 2) / 6;
      const ring = Math.floor(index / 6);
      const radius = 3 + ring * 1.5;
      const height = Math.sin(angle) * 1 + ring * 0.6;
      return [
        moonBase[0] + Math.cos(angle) * radius,
        moonBase[1] + height,
        moonBase[2] + Math.sin(angle) * radius
      ];
    } else if (planet === 'eml1') {
      // Position ships around EML-1 (Lagrange Point 1 between Earth and Moon)
      const eml1Base = [16, 2.5, 5.3]; // Approximately 85% of the way from Earth to Moon
      const angle = (index * Math.PI * 2) / 6;
      const ring = Math.floor(index / 6);
      const radius = 2.5 + ring * 1.2;
      const height = Math.sin(angle) * 0.8 + ring * 0.5;
      return [
        eml1Base[0] + Math.cos(angle) * radius,
        eml1Base[1] + height,
        eml1Base[2] + Math.sin(angle) * radius
      ];
    } else {
      // Position ships around Mars in formation
      const marsBase = [60, 10, 20];
      const angle = (index * Math.PI * 2) / 6;
      const ring = Math.floor(index / 6);
      const radius = 4 + ring * 2; // Slightly larger formation for Mars
      const height = Math.sin(angle) * 1.2 + ring * 0.7;
      return [
        marsBase[0] + Math.cos(angle) * radius,
        marsBase[1] + height,
        marsBase[2] + Math.sin(angle) * radius
      ];
    }
  };

  const getDestinationPosition = (destination: 'earth' | 'moon' | 'mars' | 'eml1'): [number, number, number] => {
    if (destination === 'earth') {
      return [3, 1, 2]; // Static position near Earth
    } else if (destination === 'moon') {
      return [26, 5, 10]; // Static position near Moon
    } else if (destination === 'eml1') {
      return [16, 2.5, 5.3]; // EML-1 position (between Earth and Moon)
    } else {
      return [64, 11, 23]; // Static position near Mars
    }
  };
  const [colonyCount, setColonyCount] = useState(0);
  const [cargoCount, setCargoCount] = useState(0);
  const [alienShipPosition, setAlienShipPosition] = useState<[number, number, number]>([15, 5, 8]);
  const [showTargetCube, setShowTargetCube] = useState(false);
  const [showBaseCube, setShowBaseCube] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([12, 2, 4]);
  const [spaceStationBuilt, setSpaceStationBuilt] = useState(false);
  const [shipFactoryBuilt, setShipFactoryBuilt] = useState(false);
  const [shipPanelDrones, setShipPanelDrones] = useState(0);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isOperationsPanelOpen, setIsOperationsPanelOpen] = useState(false);
  
  // Ship launch modal state
  const [selectedShip, setSelectedShip] = useState<{ name: string; type: 'colony' | 'cargo' } | null>(null);
  const [showShipLaunchModal, setShowShipLaunchModal] = useState(false);
  
  // Moon colonization state
  const [isMoonColonized, setIsMoonColonized] = useState(false);
  const [isMarsColonized, setIsMarsColonized] = useState(false);
  const [isEML1Colonized, setIsEML1Colonized] = useState(false);
  const [activeBuildingTab, setActiveBuildingTab] = useState<'earth' | 'moon' | 'mars'>('earth');
  
  // Building levels for each planet
  const { buildingLevels: earthBuildings, upgradeBuilding: upgradeEarthBuilding } = useBuildingLevels('Earth');
  const { buildingLevels: moonBuildings, upgradeBuilding: upgradeMoonBuilding } = useBuildingLevels('Moon');
  const { buildingLevels: marsBuildings, upgradeBuilding: upgradeMarsBuilding } = useBuildingLevels('Mars');
  
  // Planet resources for each planet
  const { resources: earthResources, productionRates: earthProduction } = usePlanetResources('Earth', earthBuildings);
  const { resources: moonResources, productionRates: moonProduction } = usePlanetResources('Moon', moonBuildings);
  const { resources: marsResources, productionRates: marsProduction } = usePlanetResources('Mars', marsBuildings);
  
  // Get current planet's building levels and upgrade function
  const getCurrentBuildings = () => {
    if (activeBuildingTab === 'earth') return earthBuildings;
    if (activeBuildingTab === 'moon') return moonBuildings;
    return marsBuildings;
  };
  
  const getCurrentUpgradeFunction = () => {
    if (activeBuildingTab === 'earth') return upgradeEarthBuilding;
    if (activeBuildingTab === 'moon') return upgradeMoonBuilding;
    return upgradeMarsBuilding;
  };
  
  const getCurrentResources = () => {
    if (activeBuildingTab === 'earth') return earthResources;
    if (activeBuildingTab === 'moon') return moonResources;
    return marsResources;
  };
  
  const getCurrentProduction = () => {
    if (activeBuildingTab === 'earth') return earthProduction;
    if (activeBuildingTab === 'moon') return moonProduction;
    return marsProduction;
  };
  
  // Ship state
  const [shipPosition, setShipPosition] = useState<[number, number, number]>([12, 2, 4]);
  const [shipRotation, setShipRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [shipVelocity, setShipVelocity] = useState<[number, number, number]>([0, 0, 0]);
  const [shipSelected, setShipSelected] = useState(false);
  const [shipTarget, setShipTarget] = useState<[number, number, number] | null>(null);
  const [isMovingToTarget, setIsMovingToTarget] = useState(false);
  
  // Keyboard state
  const keysPressed = useRef<Set<string>>(new Set());

  // Game time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format game time as HH:MM:SS
  const formatGameTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Click handlers
  const handleShipClick = () => {
    setShipSelected(true);
    setSelectedObject("ship");
    console.log("Ship selected! Press X to focus camera.");
  };

  const handleEarthClick = () => {
    if (shipSelected) {
      setShipTarget([0, 3, 0]); // Position near Earth
      setIsMovingToTarget(true);
      setShipSelected(false);
    } else {
      setSelectedObject("earth");
      console.log("Earth selected! Press X to focus camera.");
    }
  };

  const handleMoonClick = () => {
    if (shipSelected) {
      setShipTarget([22, 4, 8]); // Position near Moon (updated for new distance)
      setIsMovingToTarget(true);
      setShipSelected(false);
    } else {
      setSelectedObject("moon");
      console.log("Moon selected! Press X to focus camera.");
    }
  };

  const handleMovementComplete = () => {
    setIsMovingToTarget(false);
    setShipTarget(null);
  };

  // Process ships that have arrived with special destinations
  useEffect(() => {
    console.log('Processing builtSpheres:', builtSpheres.map(ship => ({
      name: ship.name,
      type: ship.type,
      location: ship.location,
      destination: ship.destination,
      cargo: ship.cargo
    })));
    
    setBuiltSpheres(prev => {
      let hasChanges = false;
      const updatedSpheres = prev.filter(ship => {
        // Remove colony ships that have arrived and selected "colonize"
        if (ship.type === 'colony' && ship.destination === 'colonize' && 
            ship.location !== 'earth' && ship.location !== 'preparing' && ship.location !== 'traveling') {
          console.log(`${ship.name} consumed after colonizing at ${ship.location}`);
          
          // Check if colonizing the Moon, Mars, or EML-1
          if (ship.location === 'moon') {
            setIsMoonColonized(true);
            console.log('Moon has been colonized!');
          } else if (ship.location === 'mars') {
            setIsMarsColonized(true);
            console.log('Mars has been colonized!');
          } else if (ship.location === 'eml1') {
            setIsEML1Colonized(true);
            console.log('EML-1 has been colonized!');
          }
          
          hasChanges = true;
          return false; // Remove from array
        }
        return true; // Keep in array
      }).map(ship => {
        // Reset cargo for cargo ships that have arrived and selected "offload"
        if (ship.type === 'cargo' && ship.destination === 'offload' && 
            ship.location !== 'earth' && ship.location !== 'preparing' && ship.location !== 'traveling' &&
            ship.cargo && (ship.cargo.metal > 0 || ship.cargo.fuel > 0 || ship.cargo.food > 0)) {
          console.log(`${ship.name} offloading cargo at ${ship.location}, current cargo:`, ship.cargo);
          hasChanges = true;
          return {
            ...ship,
            cargo: { metal: 0, fuel: 0, food: 0 }
          };
        }
        return ship;
      });
      
      return hasChanges ? updatedSpheres : prev;
    });
  }, [builtSpheres]);

  // Flight controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
      
      // Handle X key for camera focusing
      if (event.key.toLowerCase() === 'x' && selectedObject) {
        switch (selectedObject) {
          case 'earth':
            setCameraTarget([0, 0, 0]);
            console.log("Camera focused on Earth");
            break;
          case 'moon':
            setCameraTarget([24, 4, 8]);
            console.log("Camera focused on Moon");
            break;
          case 'ship':
            setCameraTarget(shipPosition);
            console.log("Camera focused on Ship");
            break;
          case 'targetCube':
            setCameraTarget([2.2, 0, 0]);
            console.log("Camera focused on Target Cube");
            break;
          case 'baseCube':
            setCameraTarget([24, 4.8, 8]);
            console.log("Camera focused on Base Cube");
            break;
        }
      }
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
    <div className="relative w-full h-screen overflow-hidden" style={{
      background: 'radial-gradient(ellipse at center, #1a1f3a 0%, #0f0f23 50%, #000 100%)',
      boxShadow: 'inset 0 0 200px rgba(74, 144, 226, 0.1)'
    }}>
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Game info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-blue-400">Expanse</h1>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400 font-semibold">Terran Corp</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">Level <span className="text-blue-400 font-bold">1</span></span>
              <span className="text-slate-300">Time <span className="text-emerald-400 font-mono">{formatGameTime(gameTime)}</span></span>
            </div>
          </div>
          
          {/* Center - Action buttons */}
          <div className="flex items-center gap-2">
          </div>
          
          {/* Right side - Resources and Operations Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-300 text-sm">
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900">₵</span>
                </div>
                <span className="font-medium">{credits.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-cyan-600/20 px-2 py-1 rounded border border-cyan-500/30">
                <span className="text-cyan-400 text-xs">💎</span>
                <span className="text-cyan-300 font-medium text-sm">12</span>
              </div>
              <div className="flex items-center gap-1 bg-purple-600/20 px-2 py-1 rounded border border-purple-500/30">
                <span className="text-purple-400 text-xs">⚛️</span>
                <span className="text-purple-300 font-medium text-sm">1</span>
              </div>
            </div>
            
            {/* Operations Panel Toggle */}
            <button
              onClick={() => setIsOperationsPanelOpen(!isOperationsPanelOpen)}
              className="p-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white rounded-lg border border-slate-600/50 transition-all duration-200 hover:scale-105"
              aria-label="Toggle Operations Panel"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>


      {/* Solar System Panel - Left Overlay */}
      <div className="absolute top-28 left-4 z-10 p-4 w-48">
        <h2 className="text-lg font-bold text-blue-400 mb-2 text-center">
          Solar System
        </h2>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: '#4ade80',
              boxShadow: '0 0 4px rgba(74, 222, 128, 0.2)',
              filter: 'drop-shadow(0 0 2px rgba(74, 222, 128, 0.1))'
            }}></div>
            <span className="text-blue-300 font-medium group-hover:text-blue-200 transition-colors">
              Earth
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: isMoonColonized ? '#9ca3af' : '#555',
              boxShadow: isMoonColonized ? '0 0 4px rgba(156, 163, 175, 0.2)' : 'none',
              filter: isMoonColonized ? 'drop-shadow(0 0 2px rgba(156, 163, 175, 0.1))' : 'none'
            }}></div>
            <span className={`font-medium group-hover:text-blue-200 transition-colors ${isMoonColonized ? 'text-blue-300' : 'text-gray-500'}`}>
              Moon
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: isEML1Colonized ? '#a855f7' : '#555',
              boxShadow: isEML1Colonized ? '0 0 4px rgba(168, 85, 247, 0.2)' : 'none',
              filter: isEML1Colonized ? 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.1))' : 'none'
            }}></div>
            <span className={`font-medium group-hover:text-blue-200 transition-colors ${isEML1Colonized ? 'text-blue-300' : 'text-gray-500'}`} style={{
              textShadow: isEML1Colonized ? '0 0 6px rgba(147, 197, 253, 0.3)' : 'none'
            }}>
              EML-1
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: isMarsColonized ? '#f87171' : '#555',
              boxShadow: isMarsColonized ? '0 0 4px rgba(248, 113, 113, 0.2)' : 'none',
              filter: isMarsColonized ? 'drop-shadow(0 0 2px rgba(248, 113, 113, 0.1))' : 'none'
            }}></div>
            <span className={`font-medium group-hover:text-blue-200 transition-colors ${isMarsColonized ? 'text-blue-300' : 'text-gray-500'}`} style={{
              textShadow: isMarsColonized ? '0 0 6px rgba(147, 197, 253, 0.3)' : 'none'
            }}>
              Mars
            </span>
          </div>
        </div>
      </div>

      {/* Planet Switcher - Above Bottom Panel */}
      <div className="fixed bottom-64 left-4 z-30">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 p-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-2">Planet:</span>
            <div className="flex bg-slate-800/50 rounded-md p-1">
              <button
                onClick={() => setActiveBuildingTab('earth')}
                className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                  activeBuildingTab === 'earth'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                🌍 Earth
              </button>
              <button
                onClick={() => setActiveBuildingTab('moon')}
                disabled={!isMoonColonized}
                className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                  activeBuildingTab === 'moon' && isMoonColonized
                    ? 'bg-slate-600 text-white shadow-sm'
                    : isMoonColonized
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    : 'text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                🌙 {isMoonColonized ? 'Moon' : 'Moon'}
              </button>
              <button
                onClick={() => setActiveBuildingTab('mars')}
                disabled={!isMarsColonized}
                className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                  activeBuildingTab === 'mars' && isMarsColonized
                    ? 'bg-slate-600 text-white shadow-sm'
                    : isMarsColonized
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    : 'text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                🔴 {isMarsColonized ? 'Mars' : 'Mars'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Rebuilt for proper clickability */}
      <div className={`fixed bottom-0 left-0 z-[9999] pointer-events-auto bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-tr-xl transition-all duration-300 ease-in-out ${isPanelCollapsed ? 'h-12' : 'h-[253px]'}`} style={{ width: '98.3%' }}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="absolute top-2 left-2 z-[10000] bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-600/50 transition-all duration-200 hover:scale-105"
          aria-label={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isPanelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <div className={`p-2 h-full relative z-[9999] transition-opacity duration-300 ${isPanelCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid gap-4 h-full" style={{ gridTemplateColumns: '0.71fr 0.89fr 0.75fr 0.595fr 1.6fr' }}>
            {/* Planets Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">
                  {activeBuildingTab === 'earth' ? 'Earth' : activeBuildingTab === 'moon' ? 'Moon' : 'Mars'}
                </h3>
              </div>
              
              
              {/* Show content based on active planet directly without internal tabs */}
              <div className="space-y-3 mt-0">
                {activeBuildingTab === 'earth' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-base text-slate-400">Population</span>
                      </div>
                      <span className="text-base font-bold text-slate-200">7.8B</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-base text-slate-400">Credits</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">+3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-red-400" />
                        <span className="text-base text-slate-400">Temperature</span>
                      </div>
                      <span className="text-base font-bold text-slate-200">15.2°C</span>
                    </div>
                  </>
                ) : (
                  <>
                    {isMoonColonized ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-base text-slate-400">Population</span>
                          </div>
                          <span className="text-base font-bold text-slate-200">50</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-900">₵</span>
                            </div>
                            <span className="text-base text-slate-400">Credits</span>
                          </div>
                          <span className="text-lg font-bold text-green-400">+0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-red-400" />
                            <span className="text-base text-slate-400">Temperature</span>
                          </div>
                          <span className="text-base font-bold text-slate-200">+0°C</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        Moon not yet colonized
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Resources Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Archive className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">Resources</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-green-400" />
                    <span className="text-base text-slate-400">Food</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-200">
                      {Math.floor(getCurrentResources().food)}
                    </span>
                    <span className="text-base text-green-400">
                      +{getCurrentProduction().food}/h
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-400" />
                    <span className="text-base text-slate-400">Fuel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-200">
                      {Math.floor(getCurrentResources().fuel)}
                    </span>
                    <span className="text-base text-green-400">
                      +{getCurrentProduction().fuel}/h
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-gray-400" />
                    <span className="text-base text-slate-400">Metal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-200">
                      {Math.floor(getCurrentResources().metal)}
                    </span>
                    <span className="text-base text-green-400">
                      +{getCurrentProduction().metal}/h
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-yellow-400" />
                    <span className="text-base text-slate-400">Power</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-200">
                      {Math.floor(getCurrentResources().power)}
                    </span>
                    <span className="text-base text-green-400">
                      +{getCurrentProduction().power}/h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buildings Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Building className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">Buildings</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 relative z-[9999] pointer-events-auto">
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999] min-w-0"
                    onClick={() => {
                      console.log('Lab clicked!');
                      const upgradeCost = 200;
                      if (spendCredits(upgradeCost)) {
                        getCurrentUpgradeFunction()('lab');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-base text-slate-400">Lab</span>
                      </div>
                      <span className="text-base font-bold text-slate-200 ml-auto">
                        {getCurrentBuildings().lab}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999] min-w-0"
                    onClick={() => {
                      console.log('Farm clicked!');
                      const upgradeCost = 200;
                      if (spendCredits(upgradeCost)) {
                        getCurrentUpgradeFunction()('farm');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Wheat className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-base text-slate-400">Farm</span>
                      </div>
                      <span className="text-base font-bold text-slate-200 ml-auto">
                        {getCurrentBuildings().farm}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999] min-w-0"
                    onClick={() => {
                      console.log('Mine clicked!');
                      const upgradeCost = 200;
                      if (spendCredits(upgradeCost)) {
                        getCurrentUpgradeFunction()('mine');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Pickaxe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-slate-400">Mine</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200 ml-auto">
                        {getCurrentBuildings().mine}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999] min-w-0"
                    onClick={() => {
                      console.log('Power clicked!');
                      const upgradeCost = 200;
                      if (spendCredits(upgradeCost)) {
                        getCurrentUpgradeFunction()('power');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-sm text-slate-400">Power</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200 ml-auto">
                        {getCurrentBuildings().power}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999] min-w-0"
                    onClick={() => {
                      console.log('Refinery clicked!');
                      const upgradeCost = 200;
                      if (spendCredits(upgradeCost)) {
                        getCurrentUpgradeFunction()('refinery');
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-sm text-slate-400">Refinery</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200 ml-auto">
                        {getCurrentBuildings().refinery}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ships Section - Enhanced for clickability */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 relative z-[9999] pointer-events-auto">
              <div className="flex items-center gap-3 mb-4 relative z-[9999]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">Space</h3>
              </div>
              <div className="space-y-2 relative z-[9999] pointer-events-auto">
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999]"
                     onClick={() => {
                       console.log('Colony clicked!');
                       if (spendCredits(200)) {
                         const newColonyCount = colonyCount + 1;
                         setColonyCount(newColonyCount);
                         const staticPos = getStaticPositionNearPlanet(activeBuildingTab as 'earth' | 'moon' | 'mars', builtSpheres.filter(s => s.location === activeBuildingTab).length);
                         setBuiltSpheres(prev => [...prev, { 
                           type: 'colony', 
                           staticPosition: staticPos,
                           name: `Colony ${newColonyCount}`, 
                           location: activeBuildingTab, 
                           destination: activeBuildingTab === 'earth' ? 'moon' : (activeBuildingTab === 'moon' ? 'mars' : 'earth'),
                           cargo: { metal: 2, fuel: 2, food: 2 }
                         }]);
                       }
                     }}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-400" />
                      <span className="text-base text-slate-400">Colony</span>
                    </div>
                     <div className="flex items-center gap-2">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                </div>
              </div>
            </div>
                <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999]"
                     onClick={() => {
                        console.log('Cargo clicked!');
                        if (spendCredits(200)) {
                          const newCargoCount = cargoCount + 1;
                          setCargoCount(newCargoCount);
                          const staticPos = getStaticPositionNearPlanet(activeBuildingTab as 'earth' | 'moon' | 'mars', builtSpheres.filter(s => s.location === activeBuildingTab).length);
                          setBuiltSpheres(prev => [...prev, { 
                            type: 'cargo', 
                            staticPosition: staticPos,
                            name: `Cargo ${newCargoCount}`, 
                            location: activeBuildingTab, 
                            destination: activeBuildingTab === 'earth' ? 'moon' : (activeBuildingTab === 'moon' ? 'mars' : 'earth'),
                            cargo: { metal: 10, fuel: 10, food: 10 }
                          }]);
                        }
                      }}
                   >
                     <div className="flex items-center gap-2">
                       <Package className="w-4 h-4 text-amber-400" />
                       <span className="text-base text-slate-400">Cargo</span>
                     </div>
                      <div className="flex items-center gap-2">
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                         <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                           <span className="text-xs font-bold text-slate-900">₵</span>
                         </div>
                         <span className="text-xs text-yellow-400">200</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="border border-slate-600/30 rounded-lg p-1 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                   <div 
                     className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-0.5 rounded transition-colors group relative z-[9999]"
                      onClick={() => {
                        console.log('Station clicked!');
                        // Add station functionality here later
                      }}
                   >
                     <div className="flex items-center gap-2">
                       <Satellite className="w-4 h-4 text-green-400" />
                       <span className="text-base text-slate-400">Station</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                         <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                           <span className="text-xs font-bold text-slate-900">₵</span>
                         </div>
                         <span className="text-xs text-yellow-400">500</span>
                       </div>
                     </div>
                   </div>
                 </div>
                
              </div>
            </div>

            {/* Flight Control Section - Always show for Earth, Moon only when colonized, Mars only when colonized */}
            {(activeBuildingTab === 'earth' || (activeBuildingTab === 'moon' && isMoonColonized) || (activeBuildingTab === 'mars' && isMarsColonized)) && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 relative z-[10001] pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Satellite className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">Flight Control</h3>
                </div>
                
                {/* Table Content */}
                <div className="space-y-1">
                  {(() => {
                    // Filter ships based on rules:
                    // - If Moon not colonized: Earth shows ALL ships
                    // - If Moon colonized: Ships appear in flight control of their origin planet during transit
                    const currentPlanetShips = builtSpheres.filter(ship => {
                      if (!isMoonColonized && !isMarsColonized) {
                        // Until moon/mars are colonized, all ships appear in Earth's flight control
                        return activeBuildingTab === 'earth';
                      } else {
                        // After colonization: ships show in their current location's flight control
                        if (activeBuildingTab === 'earth') {
                          // Earth shows: ships that started from Earth (destination moon/mars/etc)
                          return ship.location === 'earth' || 
                                 ship.location === 'preparing' || 
                                 (ship.location === 'traveling' && ship.destination !== 'earth');
                        } else if (activeBuildingTab === 'moon') {
                          // Moon shows: ships at moon + ships traveling FROM moon to elsewhere (only if Moon is colonized)
                          // If Moon is not colonized, ships stay in Earth's control even when arriving
                          if (isMoonColonized) {
                            return ship.location === 'moon' || 
                                   (ship.location === 'traveling' && ship.destination === 'earth');
                          }
                          return false;
                        } else if (activeBuildingTab === 'mars') {
                          // Mars shows: ships at mars + ships traveling TO mars (only if Mars is colonized)
                          // If Mars is not colonized, ships stay in Earth's control even when arriving
                          if (isMarsColonized) {
                            return ship.location === 'mars' || 
                                   (ship.location === 'traveling' && ship.destination === 'mars');
                          }
                          return false;
                        }
                      }
                      return false;
                    });
                    
                    return currentPlanetShips.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-sm">
                        No ships in {activeBuildingTab === 'earth' ? 'Earth' : activeBuildingTab === 'moon' ? 'Moon' : 'Mars'} flight control
                      </div>
                    ) : (
                      currentPlanetShips.map((ship, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] gap-3 items-center py-2 px-2 rounded bg-slate-700/30 border border-slate-600/20 relative">
                      <div className="flex items-center gap-2 min-w-0">
                        {ship.type === 'colony' ? (
                          <Home className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-slate-300 whitespace-nowrap">{ship.name}</span>
                      </div>
                      <Select 
                        defaultValue="moon"
                        onValueChange={(destination) => {
                          setBuiltSpheres(prev => prev.map(s => 
                            s.name === ship.name ? { ...s, destination } : s
                          ));
                        }}
                      >
                        <SelectTrigger className="w-20 h-6 text-xs bg-slate-700/50 border-slate-600/50 text-slate-300 [&>svg]:hidden">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 z-[20000]">
                          {ship.location !== 'earth' && (
                            <SelectItem value="earth" className="text-slate-300 hover:bg-slate-700">Earth</SelectItem>
                          )}
                          <SelectItem value="moon" className="text-slate-300 hover:bg-slate-700">Moon</SelectItem>
                          <SelectItem value="mars" className="text-slate-300 hover:bg-slate-700">Mars</SelectItem>
                          {ship.type === 'colony' && ship.location === 'earth' && (
                            <SelectItem value="eml1" className="text-slate-300 hover:bg-slate-700">EML-1</SelectItem>
                          )}
                          {ship.type === 'cargo' && (
                            <>
                              <SelectItem value="offload" className="text-slate-300 hover:bg-slate-700">Offload</SelectItem>
                              <SelectItem value="land" className="text-slate-300 hover:bg-slate-700">Land</SelectItem>
                            </>
                          )}
                          {ship.type === 'colony' && (
                            <SelectItem value="colonize" className="text-slate-300 hover:bg-slate-700">Colonize</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {ship.location === 'traveling' && ship.departureTime && ship.totalTravelTime ? (
                        <CountdownTimer
                          departureTime={ship.departureTime}
                          totalTravelTime={ship.totalTravelTime}
                          onArrival={() => {
                            // Special case: Colony ships with "colonize" destination get consumed
                            if (ship.type === 'colony' && ship.destination === 'colonize') {
                              setBuiltSpheres(prev => prev.filter(s => s.name !== ship.name));
                              console.log(`${ship.name} has been consumed while colonizing`);
                            } 
                            // Special case: Cargo ships with "offload" destination reset cargo to 0/0/0
                            else if (ship.type === 'cargo' && ship.destination === 'offload') {
                              const arrivalPlanet = ship.destination === 'offload' ? 'moon' : (ship.destination === 'earth' ? 'earth' : 'moon');
                              // Count ships already at destination for proper spacing
                              const shipsAtDestination = builtSpheres.filter(s => s.location === arrivalPlanet).length;
                              const arrivalPosition = getStaticPositionNearPlanet(arrivalPlanet, shipsAtDestination);
                              setBuiltSpheres(prev => prev.map(s => 
                                s.name === ship.name ? { 
                                  ...s, 
                                  location: arrivalPlanet,
                                  staticPosition: arrivalPosition,
                                  position: arrivalPosition,
                                  cargo: { metal: 0, fuel: 0, food: 0 },
                                  startPosition: undefined,
                                  endPosition: undefined,
                                  departureTime: undefined,
                                  totalTravelTime: undefined
                                } : s
                              ));
                              console.log(`${ship.name} has offloaded all cargo at ${arrivalPlanet}`);
                            } else {
                              // Normal arrival behavior - set to static position at destination with proper spacing
                              let arrivalPlanet: 'earth' | 'moon' | 'mars' | 'eml1';
                              if (ship.destination === 'mars') {
                                arrivalPlanet = 'mars';
                              } else if (ship.destination === 'eml1') {
                                arrivalPlanet = 'eml1';
                              } else if (ship.destination === 'moon' || ship.destination === 'colonize' || ship.destination === 'offload' || ship.destination === 'land') {
                                arrivalPlanet = 'moon';
                              } else {
                                arrivalPlanet = 'earth';
                              }
                              // Count ships already at destination to determine spacing index
                              const shipsAtDestination = builtSpheres.filter(s => s.location === arrivalPlanet).length;
                              const arrivalPosition = getStaticPositionNearPlanet(arrivalPlanet, shipsAtDestination);
                              setBuiltSpheres(prev => prev.map(s => 
                                s.name === ship.name ? { 
                                  ...s, 
                                  location: arrivalPlanet,
                                  staticPosition: arrivalPosition,
                                  position: arrivalPosition,
                                  startPosition: undefined,
                                  endPosition: undefined,
                                  departureTime: undefined,
                                  totalTravelTime: undefined
                                } : s
                              ));
                              console.log(`✅ ${ship.name} arrived at ${arrivalPlanet} and positioned statically`);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-sm text-slate-300 italic">
                          {formatTime(calculateTravelTimeSeconds(
                            ship.location === 'mars' ? 'mars' : 
                            ship.location === 'moon' ? 'moon' : 
                            ship.location === 'eml1' ? 'eml1' : 'earth', 
                            ship.destination || 'moon'
                          ))}
                        </span>
                      )}
                      <div className="text-sm flex items-center gap-0.5">
                        <span className="text-green-400">{ship.cargo?.metal !== undefined ? ship.cargo.metal : (ship.type === 'colony' ? 2 : 10)}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-orange-400">{ship.cargo?.fuel !== undefined ? ship.cargo.fuel : (ship.type === 'colony' ? 2 : 10)}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-gray-300">{ship.cargo?.food !== undefined ? ship.cargo.food : (ship.type === 'colony' ? 2 : 10)}</span>
                      </div>
                      <span className="text-sm text-green-400">
                        {ship.location === 'earth' ? 'Ready' : 
                         ship.location === 'preparing' ? 'Preparing' :
                         ship.location === 'traveling' ? 'En route' : 
                         ship.location === 'moon' ? 'At Moon' :
                         ship.location === 'eml1' ? 'At EML-1' :
                         ship.location === 'mars' ? 'At Mars' : 'Ready'}
                      </span>
                      <button 
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={ship.location !== activeBuildingTab}
                        onClick={() => {
                          if (ship.location === activeBuildingTab) {
                            // Launch with static positioning system
                            const currentPlanet = activeBuildingTab;
                            // Determine target planet based on destination
                            let targetPlanet: 'earth' | 'moon' | 'mars' | 'eml1';
                            if (ship.destination === 'mars') {
                              targetPlanet = 'mars';
                            } else if (ship.destination === 'eml1') {
                              targetPlanet = 'eml1';
                            } else if (ship.destination === 'moon' || ship.destination === 'colonize' || ship.destination === 'offload' || ship.destination === 'land') {
                              targetPlanet = 'moon';
                            } else {
                              targetPlanet = 'earth';
                            }
                            const startPos = ship.staticPosition || ship.position;
                            // Count ships that will be at destination to determine proper landing spot
                            const shipsAtTargetDestination = builtSpheres.filter(s => s.location === targetPlanet || (s.location === 'traveling' && (s.destination === targetPlanet || (s.destination === 'moon' && targetPlanet === 'moon') || (s.destination === 'earth' && targetPlanet === 'earth') || (s.destination === 'mars' && targetPlanet === 'mars')))).length;
                            const endPos = getStaticPositionNearPlanet(targetPlanet, shipsAtTargetDestination);
                            const travelTime = calculateTravelTimeSeconds(currentPlanet, targetPlanet);
                            
                            setBuiltSpheres(prev => prev.map(s => 
                              s.name === ship.name ? { 
                                ...s, 
                                location: 'traveling',
                                startPosition: startPos,
                                endPosition: endPos,
                                departureTime: Date.now(),
                                totalTravelTime: travelTime,
                                staticPosition: undefined // Clear static position during travel
                              } : s
                            ));
                            console.log(`🚀 Launching ${ship.name} from ${currentPlanet} to ${targetPlanet} (${travelTime}s journey)`, {
                              startPos,
                              endPos,
                              departureTime: Date.now(),
                              totalTravelTime: travelTime
                            });
                          }
                        }}
                      >
                        {ship.location === activeBuildingTab ? 'launch' : 
                         ship.location === 'preparing' ? 'prep' :
                         ship.location === 'traveling' ? 'flying' : 'arrived'}
                      </button>
                    </div>
                    ))
                  );
                })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Operations Panel - Collapsible */}
      {isOperationsPanelOpen && (
        <div className="absolute top-20 right-4 z-10 w-64 animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200">Operations</h3>
              </div>
            </div>
            
            {/* Operations Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Controls</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  {autoRotate ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlyMode(!flyMode)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  {flyMode ? 'Exit Flight Mode' : 'Enter Flight Mode'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>
              </div>

              {/* Construction Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Construction</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSpaceStationBuilt(!spaceStationBuilt)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <Building className="w-4 h-4 mr-2" />
                  {spaceStationBuilt ? 'Dismantle' : 'Build'} Station
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShipFactoryBuilt(!shipFactoryBuilt)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <Factory className="w-4 h-4 mr-2" />
                  {shipFactoryBuilt ? 'Dismantle' : 'Build'} Factory
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFighterDronesBuilt(!fighterDronesBuilt)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <span className="w-4 h-4 mr-2">🤖</span>
                  {fighterDronesBuilt ? 'Recall' : 'Build'} Drones
                </Button>
              </div>

              {/* Actions Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Actions</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTargetCube(!showTargetCube)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  {showTargetCube ? '🔷 Hide' : '🔷 Show'} Target
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlienShipActive(!alienShipActive)}
                  className="w-full justify-start bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/40"
                >
                  {alienShipActive ? '👽 Recall' : '👽 Deploy'} Alien
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas - Full Screen */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, rgba(74, 144, 226, 0.05) 0%, transparent 70%)',
        boxShadow: 'inset 0 0 100px rgba(135, 206, 235, 0.1)'
      }}>
        <Canvas
          camera={{ position: [-25, 15, 60], fov: 50 }}
          className="w-full h-full"
          style={{
            background: 'transparent'
          }}
        >
        {/* Enhanced Lighting - Brighter with glow effects */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, -5, -5]} intensity={1.4} color="#4A90E2" />
        <pointLight position={[10, 0, 0]} intensity={0.8} color="#87CEEB" />
        <pointLight position={[0, 10, 0]} intensity={0.6} color="#FFD700" />
        <rectAreaLight
          position={[0, 0, 20]}
          width={40}
          height={40}
          intensity={0.3}
          color="#4A90E2"
        />

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
        <CameraController flyMode={flyMode} shipPosition={new Vector3(...shipPosition)} cameraTarget={cameraTarget} />

        {/* Earth, Moon, Mars, Ship, Orbiting Ships, Grid and Atmosphere */}
        <Earth 
          autoRotate={autoRotate} 
          onEarthClick={handleEarthClick}
          onEarthDoubleClick={() => setSelectedObject("earth")}
        />
        <Moon 
          autoRotate={autoRotate} 
          onMoonClick={handleMoonClick}
          onMoonDoubleClick={() => setSelectedObject("moon")}
        />
        <Mars 
          autoRotate={autoRotate} 
          onMarsClick={() => console.log('Mars clicked')}
          onMarsDoubleClick={() => setSelectedObject("mars")}
        />
        {flyMode && (
          <CustomShip 
            position={shipPosition} 
            rotation={shipRotation} 
            selected={shipSelected}
            onShipClick={handleShipClick}
            onShipDoubleClick={() => setSelectedObject("ship")}
          />
        )}
        
        {/* Selection Rings - animated blue rings around selected objects */}
        <SelectionRing 
          position={[0, 0, 0]} 
          radius={2} 
          selected={selectedObject === "earth"} 
        />
        <SelectionRing 
          position={[24, 4, 8]} 
          radius={0.6} 
          selected={selectedObject === "moon"} 
        />
        <SelectionRing 
          position={[60, 10, 20]} 
          radius={1.33} 
          selected={selectedObject === "mars"} 
        />
        {flyMode && (
          <SelectionRing 
            position={shipPosition} 
            radius={0.8} 
            selected={selectedObject === "ship"} 
          />
        )}
        
        {/* Static Ships - rendered based on builtSpheres */}
        {builtSpheres.map((ship, index) => (
          <StaticShip
            key={ship.name}
            ship={ship}
            selected={selectedObject === ship.name}
            onShipClick={() => setSelectedObject(ship.name)}
            onShipDoubleClick={() => console.log(`Double-clicked ${ship.name}`)}
          />
        ))}
        
        {/* Coordinate System */}
        {showCoordinates && <CoordinateSystem />}
        
        <Grid3D visible={showGrid} />
        <Atmosphere />
        
        {/* Fighter Drones */}
        {fighterDronesBuilt && (
          <FighterDrones 
            alienShipPosition={alienShipActive ? alienShipPosition : undefined}
            cubeAlive={targetCubeHits < 10}
            onAlienHit={() => setAlienShipHits(prev => prev + 1)}
          />
        )}
        
        {/* Target Cube */}
        {showTargetCube && <TargetCube hitsTaken={targetCubeHits} onCubeClick={() => {
          setSelectedObject("targetCube");
          console.log("Target Cube selected! Press X to focus camera.");
        }} />}
        
        {/* Base Cube */}
        {showBaseCube && <BaseCube onCubeClick={() => {
          setSelectedObject("baseCube");
          console.log("Base Cube selected! Press X to focus camera.");
        }} />}
        
        {/* Space Station */}
        {spaceStationBuilt && <SpaceStation onSpaceStationDoubleClick={() => setSelectedObject("spaceStation")} />}
        
        {/* Ship Factory */}
        {shipFactoryBuilt && <ShipFactory onShipFactoryDoubleClick={() => setSelectedObject("shipFactory")} />}
        
        {/* Ship Panel Drones */}
        {shipFactoryBuilt && <ShipPanelDrones count={shipPanelDrones} />}
        
        {/* Static Ships */}
        {builtSpheres.map((ship, index) => (
          <StaticShip 
            key={index} 
            ship={ship}
            selected={selectedShip?.name === ship.name}
            onShipClick={() => {
              setSelectedShip({ name: ship.name, type: ship.type });
              setShowShipLaunchModal(true);
            }}
            onShipDoubleClick={() => {
              console.log(`${ship.name} double clicked!`);
            }}
          />
        ))}
        
        {/* Trajectory Ship with Figure-8 path */}
        <TrajectoryShip earthPosition={[0, 0, 0]} moonPosition={[24, 4, 8]} />
        
        
        {/* Alien Ship */}
        {alienShipActive && (
          <AlienShip 
            targetPosition={[6, 1, 2]} 
            onTargetHit={() => setTargetCubeHits(prev => prev + 1)}
            onAlienHit={() => setAlienShipHits(prev => prev + 1)}
            onPositionChange={setAlienShipPosition}
            alienShipHits={alienShipHits}
            onAlienShipDoubleClick={() => setSelectedObject("alienShip")}
          />
        )}
        
        {/* Additional Selection Rings for other objects */}
        {showTargetCube && (
          <SelectionRing 
            position={[6, 1, 2]} 
            radius={0.6} 
            selected={selectedObject === "targetCube"} 
          />
        )}
        {showBaseCube && (
          <SelectionRing 
            position={[-6, 1, -2]} 
            radius={0.6} 
            selected={selectedObject === "baseCube"} 
          />
        )}
        {spaceStationBuilt && (
          <SelectionRing 
            position={[0, 4, 0]} 
            radius={1.2} 
            selected={selectedObject === "spaceStation"} 
          />
        )}
        {shipFactoryBuilt && (
          <SelectionRing 
            position={[3, 3, 2]} 
            radius={0.8} 
            selected={selectedObject === "shipFactory"} 
          />
        )}
        {alienShipActive && (
          <SelectionRing 
            position={alienShipPosition} 
            radius={0.7} 
            selected={selectedObject === "alienShip"} 
          />
        )}

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
          maxDistance={flyMode ? 80 : 100}
          dampingFactor={0.05}
          enableDamping={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
          }}
          makeDefault
        />
        </Canvas>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Building/Ship Info</h3>
            <p className="text-slate-300 mb-4">{modalContent}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ship Launch Modal */}
      <ShipLaunchModal
        shipName={selectedShip?.name || ''}
        shipType={selectedShip?.type || 'colony'}
        isVisible={showShipLaunchModal}
        onClose={() => {
          setShowShipLaunchModal(false);
          setSelectedShip(null);
        }}
        onLaunch={() => {
          if (selectedShip) {
            // Update the ship's location to 'preparing' which triggers the launch sequence
            setBuiltSpheres(prev => prev.map(s => 
              s.name === selectedShip.name ? { ...s, location: 'preparing' } : s
            ));
            console.log(`Initiating launch sequence for ${selectedShip.name}`);
          }
          setShowShipLaunchModal(false);
          setSelectedShip(null);
        }}
      />
    </div>
  );
};

export default EarthVisualization;
