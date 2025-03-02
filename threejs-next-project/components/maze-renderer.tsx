"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import type { MazeProps } from "@/app/types/maze"

export default function MazeRenderer({ grid, cellSize = 1 }: MazeProps) {
  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas shadows camera={{ position: [0, 20, 0], fov: 60 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <MazeScene grid={grid} cellSize={cellSize} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={0}
        />
      </Canvas>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-xl font-bold">
        3D Maze Visualization
      </div>
    </div>
  )
}

function MazeScene({ grid, cellSize }: MazeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const startRef = useRef<THREE.Mesh>(null)
  const endRef = useRef<THREE.Mesh>(null)
  const startTextRef = useRef<THREE.Object3D>(null)
  const endTextRef = useRef<THREE.Object3D>(null)

  // Calculate maze dimensions
  const width = grid[0].length
  const height = grid.length
  const centerX = (width * cellSize!) / 2
  const centerZ = (height * cellSize!) / 2

  // Count walls for instanced mesh
  const wallCount = grid.reduce<number>(
    (count, row) =>
      count +
      row.reduce<number>(
        (rowCount, cell) => rowCount + (cell === 1 ? 1 : 0),
        0
      ),
    0
  );
  

  // Find start and end positions
  let startPos = { x: 0, z: 0 }
  let endPos = { x: 0, z: 0 }
  grid.forEach((row, z) => {
    row.forEach((cell, x) => {
      if (cell === 2) startPos = { x, z }
      if (cell === 3) endPos = { x, z }
    })
  })

  // Update mesh positions
  useFrame(() => {
    if (!meshRef.current) return

    let index = 0
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    // Place walls
    grid.forEach((row, z) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          // Wall
          const worldX = (x - width / 2) * cellSize!
          const worldZ = (z - height / 2) * cellSize!

          matrix.setPosition(worldX, 0, worldZ)
          meshRef.current!.setMatrixAt(index, matrix)

          // Color based on distance from center
          const distance = Math.sqrt(worldX * worldX + worldZ * worldZ)
          const hue = 0.6 // Blue-ish color
          const lightness = 0.4 + distance / (width * cellSize!) // Gradually lighter outward
          color.setHSL(hue, 0.7, lightness)
          meshRef.current!.setColorAt(index, color)

          index++
        }
      })
    })

    // Update start and end positions
    if (startRef.current) {
      const startWorldX = (startPos.x - width / 2) * cellSize!
      const startWorldZ = (startPos.z - height / 2) * cellSize!
      startRef.current.position.set(startWorldX, 0.5, startWorldZ)
    }

    if (endRef.current) {
      const endWorldX = (endPos.x - width / 2) * cellSize!
      const endWorldZ = (endPos.z - height / 2) * cellSize!
      endRef.current.position.set(endWorldX, 0.5, endWorldZ)
    }

    // Update text positions
    if (startTextRef.current) {
      const startWorldX = (startPos.x - width / 2) * cellSize!
      const startWorldZ = (startPos.z - height / 2) * cellSize!
      startTextRef.current.position.set(startWorldX, 2, startWorldZ)
    }

    if (endTextRef.current) {
      const endWorldX = (endPos.x - width / 2) * cellSize!
      const endWorldZ = (endPos.z - height / 2) * cellSize!
      endTextRef.current.position.set(endWorldX, 2, endWorldZ)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <group>
      {/* Walls using instanced mesh */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, wallCount]} castShadow receiveShadow>
        <boxGeometry args={[cellSize! * 0.9, 1.5, cellSize! * 0.9]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>

      {/* Start position */}
      <mesh ref={startRef} castShadow>
        <cylinderGeometry args={[cellSize! * 0.35, cellSize! * 0.35, 1.5, 16]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.5} />
      </mesh>

      {/* End position */}
      <mesh ref={endRef} castShadow>
        <cylinderGeometry args={[cellSize! * 0.35, cellSize! * 0.35, 1.5, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        <pointLight color="#ef4444" intensity={1} distance={3} />
      </mesh>

      {/* Labels */}
      <Text ref={startTextRef} position={[0, 2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        START
      </Text>
      <Text ref={endTextRef} position={[0, 2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        GOAL
      </Text>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
        <planeGeometry args={[width * cellSize! * 1.5, height * cellSize! * 1.5]} />
        <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid for reference */}
      <gridHelper
        args={[Math.max(width, height) * cellSize! * 1.5, Math.max(width, height) * 2, "#444444", "#222222"]}
        position={[0, -0.01, 0]}
      />
    </group>
  )
}

