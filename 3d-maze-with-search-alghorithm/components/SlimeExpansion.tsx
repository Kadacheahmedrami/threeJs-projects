"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { MeshTransmissionMaterial } from "@react-three/drei"


// Define an interface for each node in the expansion path
interface ExpansionNode {
  x: number
  z: number
  distance: number
}

interface SlimeExpansionProps {
  expansionPath: ExpansionNode[] // Previously any[], now properly typed
  startPos: { x: number; z: number }
  endPos: { x: number; z: number }
  width: number
  height: number
  cellSize: number
}

export default function SlimeExpansion({
  expansionPath,
  startPos,
  endPos,
  width,
  height,
  cellSize,
}: SlimeExpansionProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [activeCells, setActiveCells] = useState<Set<string>>(new Set())
  const [animationProgress, setAnimationProgress] = useState(0)

  // Get the maximum distance in the path
  const maxDistance = useMemo(() => {
    return Math.max(...expansionPath.map((node) => node.distance))
  }, [expansionPath])

  // Create geometry for the slime
  const slimeGeometry = useMemo(() => {
    // Create a merged geometry for all potential cells
    const geometry = new THREE.BoxGeometry(cellSize * 0.9, cellSize * 0.5, cellSize * 0.9)
    geometry.translate(0, 0.25, 0) // Lift slightly above ground
    return geometry
  }, [cellSize])

  // Animation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const newProgress = prev + 0.05
        if (newProgress >= 1) {
          clearInterval(interval)
          return 1
        }
        return newProgress
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Update active cells based on animation progress
  useEffect(() => {
    const currentDistance = Math.floor(maxDistance * animationProgress)
    const newActiveCells = new Set<string>()
    expansionPath.forEach((node) => {
      if (node.distance <= currentDistance) {
        newActiveCells.add(`${node.x},${node.z}`)
      }
    })
    setActiveCells(newActiveCells)
  }, [animationProgress, expansionPath, maxDistance])

  // Create instances for each active cell
  const instances = useMemo(() => {
    return Array.from(activeCells)
      .map((cellKey) => {
        const [x, z] = cellKey.split(",").map(Number)
        const worldX = (x - width / 2) * cellSize
        const worldZ = (z - height / 2) * cellSize

        // Skip start and end positions
        if ((x === startPos.x && z === startPos.z) || (x === endPos.x && z === endPos.z)) {
          return null
        }

        return { position: [worldX, 0, worldZ], key: cellKey }
      })
      .filter(Boolean)
  }, [activeCells, width, height, cellSize, startPos, endPos])

  // Animate the slime
  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()

    // Animate the slime material
    if (meshRef.current.material instanceof THREE.Material) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.1
    }

    // Animate the slime mesh vertices for a more organic look
    if (meshRef.current.geometry instanceof THREE.BufferGeometry) {
      const positionAttribute = meshRef.current.geometry.getAttribute("position") as THREE.BufferAttribute
      const originalPositions = slimeGeometry.getAttribute("position").array

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = originalPositions[i * 3]
        const y = originalPositions[i * 3 + 1]
        const z = originalPositions[i * 3 + 2]

        // Add subtle wave motion to the top vertices (y > 0)
        if (y > 0) {
          const waveX = Math.sin(time * 2 + x + z) * 0.05
          const waveZ = Math.cos(time * 1.5 + x) * 0.05
          const waveY = Math.sin(time * 3 + x * 0.5 + z * 0.5) * 0.08

          positionAttribute.setXYZ(i, x + waveX, y + waveY, z + waveZ)
        }
      }
      positionAttribute.needsUpdate = true
    }
  })

  return (
    <group>
      {instances.map(
        (instance) =>
          instance && (
            <mesh key={instance.key} position={instance.position as [number, number, number]} geometry={slimeGeometry}>
              <MeshTransmissionMaterial
                backside
                samples={4}
                thickness={0.5}
                chromaticAberration={0.2}
                anisotropy={0.5}
                distortion={0.5}
                distortionScale={0.5}
                temporalDistortion={0.2}
                color="#4ade80"
                attenuationDistance={0.2}
                attenuationColor="#4ade80"
                roughness={0.1}
                metalness={0.1}
                transmission={0.95}
                emissive="#4ade80"
                emissiveIntensity={0.3}
              />
            </mesh>
          ),
      )}

      {/* Central slime mesh for animation reference */}
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
    </group>
  )
}
