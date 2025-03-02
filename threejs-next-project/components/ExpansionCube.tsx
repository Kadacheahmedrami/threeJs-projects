"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ExpansionCubeProps {
  position: [number, number, number];
  scale: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
  delay: number;
}

export default function ExpansionCube({ position, scale, color, delay }: ExpansionCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState<boolean>(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(true)
    }, delay * 150)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  useFrame((state) => {
    if (!meshRef.current || !active) return
    
    const time = state.clock.getElapsedTime()
    meshRef.current.scale.y = scale.y * (1 + Math.sin(time * 5 + delay) * 0.1)
    meshRef.current.position.y = position[1] + Math.sin(time * 3 + delay * 2) * 0.1
    meshRef.current.rotation.y = Math.sin(time * 2 + delay) * 0.1
  })
  
  const currentScale = active 
    ? [scale.x, scale.y, scale.z] 
    : [0.01, 0.01, 0.01]
  
  return (
    <mesh 
      ref={meshRef}
      position={position}
      scale={currentScale as any}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.85, 1.0, 0.85]} />
      <meshStandardMaterial 
        color={color} 
        transparent={true}
        opacity={0.85}
        roughness={0.2} 
        metalness={0.3}
        emissive={color}
        emissiveIntensity={0.3} 
      />
    </mesh>
  )
}
