import React, { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { KaitaiStream } from 'kaitai-struct'
import SpyroLevel from './kaitai/parsers/SpyroLevel'

function App() {
  const [level, setLevel] = useState(null)

  useEffect(() => {
    const loadLevel = async () => {
      try {
        const response = await fetch('/levels/Sub1')
        const arrayBuffer = await response.arrayBuffer()

        const stream = new KaitaiStream(arrayBuffer)
        const parsedLevel = new SpyroLevel(stream)

        console.log('Level parsed successfully:')
        console.log('Mesh Offset:', parsedLevel.meshOffset)
        console.log('Texture Count:', parsedLevel.textureCount)
        console.log('Part Count:', parsedLevel.partCount)
        console.log(
          'Parts:',
          parsedLevel.partHeaders.map((part) => part.body)
        )

        setLevel(parsedLevel)
      } catch (error) {
        console.error('Error loading level:', error)
      }
    }

    loadLevel()
  }, [])

  return (
    <div className="container">
      <h1>Spyro Level Parser Test</h1>
      <p>Check the console for parsed level data</p>

      {level ? (
        <SpyroScene level={level} />
      ) : (
        <p>Loading level data...</p>
      )}
    </div>
  )
}

function SpyroScene({ level }) {
  return (
    <Canvas
      style={{ width: '800px', height: '600px', background: '#222' }}
      camera={{ position: [0, 5, 15], fov: 60 }}
    >
      <OrbitControls />
      <ambientLight intensity={1.3} />

      {level.partHeaders.map((part, index) => (
        <PartMesh key={index} part={part.body} />
      ))}
    </Canvas>
  )
}

function PartMesh({ part }) {
  const geometry = useMemo(() => {
    if (!part) return null

    const { highvertices, highvertColors, highpolys, highfarColors } = part

    if (!highvertices || !highpolys) return null
    if (highvertices.length === 0 || highpolys.length === 0) return null

    const newPositions = []
    const newColors = []
    const newIndices = []

    // Map to track unique vertex-color combinations.
    // If a vertex is being shared, but with a different color, we need to duplicate it to ensure correct per-vertex coloring.
    const vertexColorMap = {} // Key: `${vertexIndex}-${colorIndex}`, Value: newVertexIndex

    const getUniqueVertexIndex = (vertexIndex, colorIndex) => {
      const key = `${vertexIndex}-${colorIndex}`
      if (vertexColorMap[key] !== undefined) {
        return vertexColorMap[key]
      } else {
        // Duplicate the vertex
        const originalVertex = highvertices[vertexIndex]
        newPositions.push(
          originalVertex.x,
          originalVertex.y,
          originalVertex.z
        )

        // Choose the appropriate color
        const color = highfarColors[colorIndex]
        newColors.push(
          color.r / 255, // Normalize to [0, 1]
          color.g / 255,
          color.b / 255
        )

        // Assign the new index
        const newIndex = (newPositions.length / 3) - 1
        vertexColorMap[key] = newIndex
        return newIndex
      }
    }

    // Iterate over each polygon to build the new geometry
    highpolys.forEach((poly) => {
      const { v0, v1, v2, v3 } = poly.vert
      const { c0, c1, c2, c3 } = poly.color // Indices into highfarColors

      // Get unique vertex indices
      const iv0 = getUniqueVertexIndex(v0, c0)
      const iv1 = getUniqueVertexIndex(v1, c1)
      const iv2 = getUniqueVertexIndex(v2, c2)
      const iv3 = getUniqueVertexIndex(v3, c3)

      // Define two triangles per quad
      if (!poly.inverseSide) {
        newIndices.push(iv0, iv1, iv3) // First triangle
        newIndices.push(iv1, iv2, iv3) // Second triangle
      } else {
        newIndices.push(iv1, iv0, iv3) // First triangle (inverted)
        newIndices.push(iv1, iv3, iv2) // Second triangle (inverted)
      }
    })

    // Create BufferGeometry
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3))
    geom.setIndex(new THREE.Uint16BufferAttribute(newIndices, 1))

    geom.computeVertexNormals() // Compute normals for lighting

    return geom
  }, [part])

  if (!geometry) return null

  return (
    <mesh 
      geometry={geometry}
      rotation-x={-Math.PI / 2}
      scale={10} 
      position={[5, 0, 10]}
    >
      <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide}/>
    </mesh>
  )
}

export default App
