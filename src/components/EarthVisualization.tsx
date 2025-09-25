import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader, Vector3 } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Grid3X3, Plane, Users, Zap, Factory, Building, Coins, Gem, Hammer, Fuel, Battery, UtensilsCrossed, FlaskConical, Wheat, Pickaxe, Globe, Moon as MoonIcon, Satellite, Rocket, Home, Package, Archive } from 'lucide-react';
import earthTexture from '@/assets/earth-2k-texture.jpg';
import moonTexture from '@/assets/moon-texture-2k.jpg';

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

// CameraController component - follows ship in fly mode but allows rotation
const CameraController = ({ flyMode, shipPosition, cameraTarget }: { 
  flyMode: boolean; 
  shipPosition: Vector3;
  cameraTarget: [number, number, number];
}) => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());
  const lastCameraTarget = useRef<[number, number, number]>([0, 0, 0]);
  
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
      // Handle camera target changes when not in fly mode
      const [x, y, z] = cameraTarget;
      const [lastX, lastY, lastZ] = lastCameraTarget.current;
      
      // Check if camera target has changed
      if (x !== lastX || y !== lastY || z !== lastZ) {
        lastCameraTarget.current = [x, y, z];
        
        // Move camera to a good viewing position for the target
        const targetPos = new Vector3(x, y, z);
        let cameraDistance = 8; // Default distance
        
        // Adjust distance based on target
        if (x === 24 && y === 4 && z === 8) { // Moon position
          cameraDistance = 4; // Closer for moon
        } else if (x === 0 && y === 0 && z === 0) { // Earth position
          cameraDistance = 8; // Standard distance for Earth
        }
        
        // Position camera at a good angle
        const cameraPos = new Vector3(
          targetPos.x + cameraDistance * 0.8,
          targetPos.y + cameraDistance * 0.5,
          targetPos.z + cameraDistance * 0.8
        );
        
        camera.position.copy(cameraPos);
        camera.lookAt(targetPos);
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

const EarthVisualization = () => {
  const [autoRotate, setAutoRotate] = useState(true); // Start with animation enabled
  const [showGrid, setShowGrid] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [flyMode, setFlyMode] = useState(false);
  const [fighterDronesBuilt, setFighterDronesBuilt] = useState(false);
  const [alienShipActive, setAlienShipActive] = useState(false);
  const [targetCubeHits, setTargetCubeHits] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [alienShipHits, setAlienShipHits] = useState(0);
  const [alienShipPosition, setAlienShipPosition] = useState<[number, number, number]>([15, 5, 8]);
  const [showTargetCube, setShowTargetCube] = useState(false);
  const [showBaseCube, setShowBaseCube] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [spaceStationBuilt, setSpaceStationBuilt] = useState(false);
  const [shipFactoryBuilt, setShipFactoryBuilt] = useState(false);
  const [shipPanelDrones, setShipPanelDrones] = useState(0);
  
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
              <h1 className="text-xl font-bold text-blue-400">Expanse v0.1</h1>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400 font-semibold">Terran Corp</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">Level <span className="text-blue-400 font-bold">1</span></span>
              <span className="text-slate-300">Time <span className="text-emerald-400 font-mono">5:44:03</span></span>
            </div>
          </div>
          
          {/* Center - Action buttons */}
          <div className="flex items-center gap-2">
          </div>
          
          {/* Right side - Resources */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-300 text-sm">
              <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-900">₵</span>
              </div>
              <span className="font-medium">27,07</span>
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
              backgroundColor: '#9ca3af',
              boxShadow: '0 0 4px rgba(156, 163, 175, 0.2)',
              filter: 'drop-shadow(0 0 2px rgba(156, 163, 175, 0.1))'
            }}></div>
            <span className="text-blue-300 font-medium group-hover:text-blue-200 transition-colors">
              Moon
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: '#a855f7',
              boxShadow: '0 0 4px rgba(168, 85, 247, 0.2)',
              filter: 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.1))'
            }}></div>
            <span className="text-blue-300 font-medium group-hover:text-blue-200 transition-colors">
              EML 1
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-1 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group">
            <div className="w-4 h-4 rounded-full" style={{
              backgroundColor: '#f87171',
              boxShadow: '0 0 4px rgba(248, 113, 113, 0.2)',
              filter: 'drop-shadow(0 0 2px rgba(248, 113, 113, 0.1))'
            }}></div>
            <span className="text-blue-300 font-medium group-hover:text-blue-200 transition-colors" style={{
              textShadow: '0 0 6px rgba(147, 197, 253, 0.3)'
            }}>
              Mars
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Rebuilt for proper clickability */}
      <div className="fixed bottom-0 left-0 z-[9999] pointer-events-auto bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 rounded-tr-xl" style={{ height: '253px', width: '70%' }}>
        <div className="p-2 h-full relative z-[9999]">
          <div className="grid grid-cols-4 gap-4 h-full">
            {/* Earth Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400">🌍</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Earth</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Population</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200">7.8B</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-900">₵</span>
                    </div>
                    <span className="text-sm text-slate-400">Credits</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200">27,071</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-slate-400">Temperature</span>
                  </div>
                  <span className="text-sm font-bold text-slate-200">15.2°C</span>
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Archive className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Resources</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Food</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">500</span>
                    <span className="text-sm text-green-400">+7</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-slate-400">Fuel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">200</span>
                    <span className="text-sm text-green-400">+3</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-slate-400">Metal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">800</span>
                    <span className="text-sm text-green-400">+9</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">Power</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">100</span>
                    <span className="text-sm text-green-400">+5</span>
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
                <h3 className="text-lg font-semibold text-slate-200">Buildings</h3>
              </div>
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                  onClick={() => {
                    console.log('Lab clicked!');
                    setModalContent('Lab Building - Upgrade Cost: ₵ 200');
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-400">Lab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">2</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">₵</span>
                      </div>
                      <span className="text-xs text-yellow-400">200</span>
                    </div>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                  onClick={() => {
                    console.log('Farm clicked!');
                    setModalContent('Farm Building - Upgrade Cost: ₵ 200');
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-400">Farm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">5</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">₵</span>
                      </div>
                      <span className="text-xs text-yellow-400">200</span>
                    </div>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                  onClick={() => {
                    console.log('Mine clicked!');
                    setModalContent('Mine Building - Upgrade Cost: ₵ 200');
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Pickaxe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-slate-400">Mine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">3</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">₵</span>
                      </div>
                      <span className="text-xs text-yellow-400">200</span>
                    </div>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                  onClick={() => {
                    console.log('Power clicked!');
                    setModalContent('Power Building - Upgrade Cost: ₵ 200');
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-400">Power</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">4</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">₵</span>
                      </div>
                      <span className="text-xs text-yellow-400">200</span>
                    </div>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                  onClick={() => {
                    console.log('Refinery clicked!');
                    setModalContent('Refinery Building - Upgrade Cost: ₵ 200');
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-slate-400">Refinery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">1</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">₵</span>
                      </div>
                      <span className="text-xs text-yellow-400">200</span>
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
                <h3 className="text-lg font-semibold text-slate-200">Ships</h3>
              </div>
              <div className="space-y-3 relative z-[9999] pointer-events-auto">
                <div className="border border-slate-600/30 rounded-lg p-2 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                    onClick={() => {
                      console.log('Colony clicked!');
                      setModalContent('Colony Ship - Purchase Cost: ₵ 200');
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Colony</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">1</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                </div>
              </div>
            </div>
                <div className="border border-slate-600/30 rounded-lg p-2 hover:border-slate-500/50 transition-colors relative z-[9999] pointer-events-auto">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded transition-colors group relative z-[9999]"
                    onClick={() => {
                      console.log('Cargo clicked!');
                      setModalContent('Cargo Ship - Purchase Cost: ₵ 200');
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-slate-400">Cargo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">3</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-900">₵</span>
                        </div>
                        <span className="text-xs text-yellow-400">200</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Test Deploy Alien Button */}
                <div className="mt-4 relative z-[9999] pointer-events-auto">
                  <button
                    className="w-full bg-blue-800/80 border border-blue-600 text-blue-300 hover:bg-blue-700/80 px-3 py-2 rounded transition-colors relative z-[9999] pointer-events-auto cursor-pointer"
                    onClick={() => {
                      console.log('Ships panel Deploy Alien clicked!');
                      setAlienShipActive(!alienShipActive);
                    }}
                  >
                    {alienShipActive ? '👽 Recall' : '👽 Deploy'} Alien (Test)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Button - Separate Section to the Right */}
      <div className="absolute bottom-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-l border-slate-700 rounded-tl-xl p-4 z-[9999]" style={{ height: '253px', width: '200px' }}>
        <div className="flex flex-col justify-center h-full">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded transition-colors cursor-pointer font-semibold"
            onClick={() => {
              console.log('Test button clicked!');
              alert('Test button works!');
              setModalContent('Test Button Clicked - Modal System Working!');
              setShowModal(true);
              console.log('Modal should show:', showModal);
            }}
          >
            Test
          </button>
          <div className="mt-2 text-xs text-slate-400">
            Click to test modal
          </div>
        </div>
      </div>

      {/* Right Side Panels */}
      <div className="absolute top-20 right-4 z-10 space-y-4 w-52">
        {/* Operations Panel */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Operations</h3>
          </div>
          
          <div className="space-y-2">
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
        </div>

        {/* Construction Panel */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Factory className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Construction</h3>
          </div>
          
          <div className="space-y-2">
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
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700/80"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTargetCube(!showTargetCube)}
            className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700/80"
          >
            {showTargetCube ? '🔷 Hide' : '🔷 Show'} Target
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Right panel Deploy Alien #2 clicked!');
              setAlienShipActive(!alienShipActive);
            }}
            className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700/80"
          >
            {alienShipActive ? '👽 Recall' : '👽 Deploy'} Alien 2
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlienShipActive(!alienShipActive)}
            className="w-full bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700/80"
          >
            {alienShipActive ? '👽 Recall' : '👽 Deploy'} Alien
          </Button>
        </div>
      </div>

      {/* 3D Canvas - Full Screen */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, rgba(74, 144, 226, 0.05) 0%, transparent 70%)',
        boxShadow: 'inset 0 0 100px rgba(135, 206, 235, 0.1)'
      }}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 50 }}
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

        {/* Earth, Moon, Ship, Orbiting Ships, Grid and Atmosphere */}
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
        {flyMode && (
          <SelectionRing 
            position={shipPosition} 
            radius={0.8} 
            selected={selectedObject === "ship"} 
          />
        )}
        
        {/* Orbiting ships around moon */}
        <OrbitingShip moonPosition={[24, 4, 8]} index={0} />
        <OrbitingShip moonPosition={[24, 4, 8]} index={1} />
        <OrbitingShip moonPosition={[24, 4, 8]} index={2} />
        
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
          maxDistance={flyMode ? 40 : 30}
          dampingFactor={0.05}
          enableDamping={true}
          target={flyMode ? new Vector3(...shipPosition) : new Vector3(...cameraTarget)}
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
    </div>
  );
};

export default EarthVisualization;
