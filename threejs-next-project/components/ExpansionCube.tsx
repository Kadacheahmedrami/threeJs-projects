"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ExpansionCubeProps {
  position: [number, number, number]
  scale: {
    x: number
    y: number
    z: number
  }
  color: string
  delay: number
  neighbors?: { x: number; z: number }[]
}

export default function ExpansionCube({ position, scale, color, delay, neighbors }: ExpansionCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState<boolean>(false)
  const [fullyAnimated, setFullyAnimated] = useState<boolean>(false)

  useEffect(() => {
    // Clear any existing timeouts to prevent memory leaks
    const timers: NodeJS.Timeout[] = []

    const timer = setTimeout(() => {
      setActive(true)

      // Set fully animated after the initial expansion
      const fullTimer = setTimeout(() => {
        setFullyAnimated(true)
      }, 500)

      timers.push(fullTimer)
    }, delay * 100) // Faster animation sequence

    timers.push(timer)

    return () => {
      // Clean up all timeouts when component unmounts or re-renders
      timers.forEach((t) => clearTimeout(t))
    }
  }, [delay])

  useFrame((state) => {
    if (!meshRef.current || !active) return

    const time = state.clock.getElapsedTime()

    if (fullyAnimated) {
      // More dynamic animation after full expansion
    } else {
      // Initial expansion animation
      const progress = Math.min((state.clock.elapsedTime - delay * 0.1) * 2, 1)
      meshRef.current.scale.set(scale.x * progress, scale.y * progress, scale.z * progress)
    }

    // Dynamic color pulsing
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      const emissiveIntensity = 0.3 + Math.sin(time * 4 + delay) * 0.2
      meshRef.current.material.emissiveIntensity = emissiveIntensity
    }
  })

  // Start with zero scale and expand to full size
  const initialScale = active ? [scale.x, scale.y, scale.z] : [0.01, 0.01, 0.01]

  return (
    <mesh ref={meshRef} position={position} scale={initialScale as any} castShadow receiveShadow>
      <boxGeometry args={[1.0, 1.0, 1.0]} /> {/* Full size to remove gaps */}
      <meshStandardMaterial
        color={color}
        transparent={true}
        opacity={0.9}
        roughness={0.2}
        metalness={0.4}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

