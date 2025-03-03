"use client"

import { useRef, useMemo } from "react"
import * as THREE from "three"
import { createNoise2D } from "simplex-noise"

interface TerrainMeshProps {
  width: number
  height: number
  position?: [number, number, number]
  resolution?: number
}

export default function TerrainMesh({ width, height, position = [0, 0, 0], resolution = 64 }: TerrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create noise generator
  const noise2D = useMemo(() => createNoise2D(), [])

  // Generate terrain geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, resolution, resolution)

    // Apply noise to vertices
    const positionAttribute = geo.getAttribute("position")
    const vertex = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)

      // Scale coordinates to get smoother noise
      const x = vertex.x * 0.05
      const z = vertex.y * 0.05 // y in plane geometry is z in world

      // Apply multiple octaves of noise for more natural terrain
      let elevation = 0
      elevation += noise2D(x * 1, z * 1) * 0.5
      elevation += noise2D(x * 2, z * 2) * 0.25
      elevation += noise2D(x * 4, z * 4) * 0.125

      // Scale down the elevation for subtle terrain
      vertex.z = elevation * 0.5

      // Update the vertex position
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    // Update normals for proper lighting
    geo.computeVertexNormals()

    return geo
  }, [width, height, resolution, noise2D])

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.2} wireframe={false} flatShading={true} />
    </mesh>
  )
}

