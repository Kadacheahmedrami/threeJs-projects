"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import ExpansionCube from "./ExpansionCube"
import type { MazeProps } from "@/app/types/maze"
import { calculateBfsExpansionPath } from "@/app/utils/bfs"

interface MazeSceneProps extends MazeProps {
  isAnimating: boolean;
  startAnimation: () => void;
  cellSize?: number;
}

export default function MazeScene({ grid, cellSize = 1, isAnimating, startAnimation }: MazeSceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const startRef = useRef<THREE.Mesh>(null)
  const endRef = useRef<THREE.Mesh>(null)
  const startTextRef = useRef<THREE.Object3D>(null)
  const endTextRef = useRef<THREE.Object3D>(null)
  const [expansionPath, setExpansionPath] = useState<any[]>([])
  const { raycaster, camera, mouse } = useThree()

  // Calculate maze dimensions
  const width = grid[0].length
  const height = grid.length
  
  // Count walls for the instanced mesh
  const wallCount = grid.reduce<number>(
    (count, row) =>
      count +
      row.reduce<number>(
        (rowCount, cell) => rowCount + (cell === 1 ? 1 : 0),
        0
      ),
    0
  )

  // Memoize start and end positions to avoid re-creation on every render
  const { startPos, endPos } = useMemo(() => {
    let start = { x: 0, z: 0 }
    let end = { x: 0, z: 0 }
    grid.forEach((row, z) => {
      row.forEach((cell, x) => {
        if (cell === 2) start = { x, z }
        if (cell === 3) end = { x, z }
      })
    })
    return { startPos: start, endPos: end }
  }, [grid])

  // Use the BFS utility to calculate the expansion path when animation starts
  useEffect(() => {
    if (!isAnimating) return
    const expansionNodes = calculateBfsExpansionPath(grid, startPos)
    setExpansionPath(expansionNodes)
  }, [isAnimating, grid, startPos])

  const handleStartClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!isAnimating) {
      startAnimation()
    }
  }

  useFrame((state) => {
    if (!meshRef.current) return

    let index = 0
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    // Handle start cube hover effect
    if (startRef.current) {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(startRef.current)
      if (intersects.length > 0 && !isAnimating) {
        startRef.current.scale.set(1.1, 1.1, 1.1)
      } else if (!isAnimating) {
        startRef.current.scale.set(1, 1, 1)
      }
    }

    // Place walls using the instanced mesh
    grid.forEach((row, z) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          const worldX = (x - width / 2) * cellSize
          const worldZ = (z - height / 2) * cellSize

          matrix.setPosition(worldX, 0, worldZ)
          meshRef.current!.setMatrixAt(index, matrix)

          const distance = Math.sqrt(worldX * worldX + worldZ * worldZ)
          const hue = 0.6
          const lightness = 0.4 + distance / (width * cellSize)
          color.setHSL(hue, 0.7, lightness)
          meshRef.current!.setColorAt(index, color)

          index++
        }
      })
    })

    // Update start and end cube positions
    if (startRef.current) {
      const startWorldX = (startPos.x - width / 2) * cellSize
      const startWorldZ = (startPos.z - height / 2) * cellSize
      startRef.current.position.set(startWorldX, 0.5, startWorldZ)
    }

    if (endRef.current) {
      const endWorldX = (endPos.x - width / 2) * cellSize
      const endWorldZ = (endPos.z - height / 2) * cellSize
      endRef.current.position.set(endWorldX, 0.5, endWorldZ)
    }

    // Update label positions
    if (startTextRef.current) {
      const startWorldX = (startPos.x - width / 2) * cellSize
      const startWorldZ = (startPos.z - height / 2) * cellSize
      startTextRef.current.position.set(startWorldX, 2, startWorldZ)
    }

    if (endTextRef.current) {
      const endWorldX = (endPos.x - width / 2) * cellSize
      const endWorldZ = (endPos.z - height / 2) * cellSize
      endTextRef.current.position.set(endWorldX, 2, endWorldZ)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <group>
      {/* Walls */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, wallCount]} castShadow receiveShadow>
        <boxGeometry args={[cellSize * 0.9, 1.5, cellSize * 0.9]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>

      {/* Start Cube */}
      <mesh ref={startRef} castShadow onClick={handleStartClick}>
        <boxGeometry args={[cellSize * 0.7, cellSize * 0.7, cellSize * 0.7]} />
        <meshStandardMaterial 
          color="#4ade80" 
          emissive="#4ade80" 
          emissiveIntensity={0.5} 
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* End Cube */}
      <mesh ref={endRef} castShadow>
        <boxGeometry args={[cellSize * 0.7, cellSize * 0.7, cellSize * 0.7]} />
        <meshStandardMaterial 
          color="#ef4444" 
          emissive="#ef4444" 
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.5}
        />
        <pointLight color="#ef4444" intensity={1} distance={3} />
      </mesh>

      {/* BFS Expansion Cubes */}
      {isAnimating && expansionPath.map((node) => {
        if (
          (node.x === startPos.x && node.z === startPos.z) ||
          (node.x === endPos.x && node.z === endPos.z)
        ) {
          return null
        }
        
        const worldX = (node.x - width / 2) * cellSize
        const worldZ = (node.z - height / 2) * cellSize
        
        const maxDistance = Math.max(...expansionPath.map(n => n.distance))
        const colorProgress = node.distance / maxDistance
        const cubeColor = new THREE.Color().setHSL(
          0.3 - (0.3 * colorProgress),
          0.8,
          0.5
        ).getHexString()
        
        return (
          <ExpansionCube 
            key={`${node.x}-${node.z}`}
            position={[worldX, 0.5, worldZ]}
            scale={{ x: 0.7 * cellSize, y: 0.7 * cellSize, z: 0.7 * cellSize }}
            color={`#${cubeColor}`}
            delay={node.distance}
          />
        )
      })}

      {/* Labels */}
      <Text ref={startTextRef} position={[0, 2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        START
      </Text>
      <Text ref={endTextRef} position={[0, 2, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        GOAL
      </Text>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
        <planeGeometry args={[width * cellSize * 1.5, height * cellSize * 1.5]} />
        <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid Helper */}
      <gridHelper
        args={[Math.max(width, height) * cellSize * 1.5, Math.max(width, height) * 2, "#444444", "#222222"]}
        position={[0, -0.01, 0]}
      />
    </group>
  )
}
