"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import type { MazeProps, MazeGrid } from "@/app/types/maze"

// Extended props interface for MazeScene
interface MazeSceneProps extends MazeProps {
  isAnimating: boolean;
  startAnimation: () => void;
  cellSize?: number;
}

// ExpansionCube props interface
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

// BFS Queue Node type
interface QueueNode {
  x: number;
  z: number;
  distance: number;
  parent: QueueNode | null;
}

// ExpansionNode for animation
interface ExpansionNode {
  x: number;
  z: number;
  distance: number;
}

export default function MazeRenderer({ grid, cellSize = 1 }: MazeProps) {
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  
  const startAnimation = () => {
    setIsAnimating(true)
  }

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
        <MazeScene 
          grid={grid} 
          cellSize={cellSize} 
          isAnimating={isAnimating} 
          startAnimation={startAnimation}
        />
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
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
        Click on the green START cube to begin expansion animation
      </div>
    </div>
  )
}

// Expansion cube component for the animation
function ExpansionCube({ position, scale, color, delay }: ExpansionCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [active, setActive] = useState<boolean>(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(true)
    }, delay * 150) // Stagger the animation
    
    return () => clearTimeout(timer)
  }, [delay])
  
  useFrame((state) => {
    if (!meshRef.current || !active) return
    
    // Slimy pulsing effect
    const time = state.clock.getElapsedTime()
    meshRef.current.scale.y = scale.y * (1 + Math.sin(time * 5 + delay) * 0.1)
    
    // Slithering serpent-like movement
    meshRef.current.position.y = position[1] + Math.sin(time * 3 + delay * 2) * 0.1
    
    // Slight rotation for more organic feel
    meshRef.current.rotation.y = Math.sin(time * 2 + delay) * 0.1
  })
  
  // Size transition on appearance
  const currentScale = active 
    ? [scale.x, scale.y, scale.z] 
    : [0.01, 0.01, 0.01]
  
  return (
    <mesh 
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
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

function MazeScene({ grid, cellSize = 1, isAnimating, startAnimation }: MazeSceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const startRef = useRef<THREE.Mesh>(null)
  const endRef = useRef<THREE.Mesh>(null)
  const startTextRef = useRef<THREE.Object3D>(null)
  const endTextRef = useRef<THREE.Object3D>(null)
  const [expansionPath, setExpansionPath] = useState<ExpansionNode[]>([])
  const { raycaster, camera, mouse } = useThree()

  // Calculate maze dimensions
  const width = grid[0].length
  const height = grid.length
  
  // Count walls for instanced mesh
  const wallCount = grid.reduce<number>(
    (count, row) =>
      count +
      row.reduce<number>(
        (rowCount, cell) => rowCount + (cell === 1 ? 1 : 0),
        0
      ),
    0
  )

  // Memoize start and end positions to prevent re-creating objects on every render
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

  // BFS algorithm for expansion
  useEffect(() => {
    if (!isAnimating) return
    
    // Run BFS to find path through maze
    const visited: boolean[][] = Array(height)
      .fill(0)
      .map(() => Array(width).fill(false))
    const queue: QueueNode[] = []
    const expansionNodes: ExpansionNode[] = []
    
    // Start BFS from start position
    queue.push({ x: startPos.x, z: startPos.z, distance: 0, parent: null })
    visited[startPos.z][startPos.x] = true
    
    // BFS search directions: right, down, left, up
    const dx = [1, 0, -1, 0]
    const dz = [0, 1, 0, -1]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      
      // Add to expansion path with distance for delay timing
      expansionNodes.push({
        x: current.x,
        z: current.z,
        distance: current.distance
      })
      
      // Check if we've reached the end
      if (grid[current.z][current.x] === 3) {
        break
      }
      
      // Explore in all four directions
      for (let i = 0; i < 4; i++) {
        const newX = current.x + dx[i]
        const newZ = current.z + dz[i]
        
        // Check if valid move (within bounds, not a wall, not visited)
        if (
          newX >= 0 && newX < width &&
          newZ >= 0 && newZ < height &&
          grid[newZ][newX] !== 1 &&
          !visited[newZ][newX]
        ) {
          visited[newZ][newX] = true
          queue.push({
            x: newX,
            z: newZ,
            distance: current.distance + 1,
            parent: current
          })
        }
      }
    }
    
    setExpansionPath(expansionNodes)
  }, [isAnimating, grid, height, width, startPos])

  // Handle click on start cube with correct event type for React Three Fiber
  const handleStartClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!isAnimating) {
      startAnimation()
    }
  }

  // Update mesh positions on every frame
  useFrame((state) => {
    if (!meshRef.current) return

    let index = 0
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()

    // Check if start cube was clicked
    if (startRef.current) {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(startRef.current)
      if (intersects.length > 0 && !isAnimating) {
        startRef.current.scale.set(1.1, 1.1, 1.1)
      } else if (!isAnimating) {
        startRef.current.scale.set(1, 1, 1)
      }
    }

    // Place walls
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

    // Update text positions
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
      {/* Walls using instanced mesh */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, wallCount]} castShadow receiveShadow>
        <boxGeometry args={[cellSize * 0.9, 1.5, cellSize * 0.9]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>

      {/* Start cube */}
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

      {/* End cube */}
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

      {/* Grid helper */}
      <gridHelper
        args={[Math.max(width, height) * cellSize * 1.5, Math.max(width, height) * 2, "#444444", "#222222"]}
        position={[0, -0.01, 0]}
      />
    </group>
  )
}
