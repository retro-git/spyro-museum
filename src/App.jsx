import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { KaitaiStream } from 'kaitai-struct';
import SpyroLevel from './kaitai/parsers/SpyroLevel';
import { LevelSelector } from './components/LevelSelector';

// Separate the main app logic into a component that can access URL params
function LevelViewer() {
  const { levelPath } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [currentLevelPath, setCurrentLevelPath] = useState(null);
  const [level, setLevel] = useState(null);
  const [isHighPoly, setIsHighPoly] = useState(true);

  // Modified setCurrentLevelPath to update URL
  const handleLevelPathChange = (path) => {
    // Remove '/levels/' prefix and '/sub1' suffix for cleaner URLs
    const urlPath = path.replace('/levels/', '').replace('/sub1', '');
    navigate(`/level/${urlPath}`);
    setCurrentLevelPath(`/levels/${urlPath}/sub1`); // Keep sub1 for actual file path
  };

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch('/levels/levels.json');
        const levelsData = await response.json();
        setGameData(levelsData);

        // If we have a levelPath from URL, use it
        if (levelPath) {
          // Make sure the levelPath includes both game and level names
          const pathParts = levelPath.split('/');
          if (pathParts.length === 1) {
            // If only game name is provided, redirect to the first level
            const gameName = pathParts[0];
            const firstLevelNameSnake = toSnakeCase(levelsData.homeworlds[0].name);
            const fullPath = `/levels/${gameName}/${firstLevelNameSnake}/sub1`;
            handleLevelPathChange(fullPath);
          } else {
            setCurrentLevelPath(`/levels/${levelPath}/sub1`);
          }
        } else if (!currentLevelPath && !levelPath) { // Only set default if we have neither
          // Set default level if no URL path
          const gameName = levelsData.game_name.toLowerCase();
          const firstLevelNameSnake = toSnakeCase(levelsData.homeworlds[0].name);
          const defaultPath = `/levels/${gameName}/${firstLevelNameSnake}/sub1`;
          handleLevelPathChange(defaultPath);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, [levelPath]); // Remove currentLevelPath from dependencies

  useEffect(() => {
    if (!currentLevelPath) return;

    const loadLevel = async () => {
      try {
        console.log('Fetching level from:', currentLevelPath);
        const response = await fetch(currentLevelPath);
        console.log('Level response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to load level at ${currentLevelPath}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log('Level data size:', arrayBuffer.byteLength, 'bytes');

        const stream = new KaitaiStream(arrayBuffer);
        const parsedLevel = new SpyroLevel(stream);

        console.log('Level parsed successfully:', parsedLevel);
        setLevel(parsedLevel);
      } catch (error) {
        console.error('Error loading level:', error);
      }
    };

    loadLevel();
  }, [currentLevelPath]);

  // Utility function to convert names to snake_case
  function toSnakeCase(str) {
    return str.toLowerCase()
      .replace(/'s/g, 's')  // Handle possessives
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  }

  return (
    <div className="container">
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <button onClick={() => setIsHighPoly(!isHighPoly)}>
          {isHighPoly ? 'Switch to Low Poly' : 'Switch to High Poly'}
        </button>
      </div>
      <Canvas
        style={{ width: '100vw', height: '100vh', background: '#222' }}
        camera={{ position: [0, 5, 15], fov: 60 }}
      >
        <OrbitControls />
        <ambientLight intensity={1.3} />
        {level &&
          level.partHeaders.map((part, index) => (
            <PartMesh key={index} part={part.body} isHighPoly={isHighPoly} />
          ))}
      </Canvas>
      {gameData && (
        <LevelSelector
          gameName={gameData.game_name}
          homeworlds={gameData.homeworlds}
          currentLevelPath={currentLevelPath}
          setCurrentLevelPath={handleLevelPathChange}
          toSnakeCase={toSnakeCase}
          isHighPoly={isHighPoly}
          setIsHighPoly={setIsHighPoly}
        />
      )}
    </div>
  );
}

// Main App component now just handles routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LevelViewer />} />
        <Route path="/level/:levelPath/*" element={<LevelViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

function PartMesh({ part, isHighPoly }) {
  const geometry = useMemo(() => {
    if (!part) return null;

    // Select vertices, polys, and colors based on poly mode
    const vertices = isHighPoly ? part.highvertices : part.lowvertices;
    const polys = isHighPoly ? part.highpolys : part.lowpolys;
    const colors = isHighPoly ? part.highfarColors : part.lowvertColors;

    if (!vertices || !polys) return null;
    if (vertices.length === 0 || polys.length === 0) return null;

    const newPositions = [];
    const newColors = [];
    const newIndices = [];

    const vertexColorMap = {};

    const getUniqueVertexIndex = (vertexIndex, colorIndex) => {
      const key = `${vertexIndex}-${colorIndex}`;
      if (vertexColorMap[key] !== undefined) {
        return vertexColorMap[key];
      } else {
        const originalVertex = vertices[vertexIndex];
        newPositions.push(originalVertex.x, originalVertex.y, originalVertex.z);

        const color = colors[colorIndex];
        newColors.push(
          Math.pow(color.r / 255, 1.5),
          Math.pow(color.g / 255, 1.5),
          Math.pow(color.b / 255, 1.5)
        );

        const newIndex = newPositions.length / 3 - 1;
        vertexColorMap[key] = newIndex;
        return newIndex;
      }
    };

    polys.forEach((poly) => {
      const { v0, v1, v2, v3 } = poly.vert;
      const { c0, c1, c2, c3 } = poly.color;

      const iv0 = getUniqueVertexIndex(v0, c0);
      const iv1 = getUniqueVertexIndex(v1, c1);
      const iv2 = getUniqueVertexIndex(v2, c2);
      const iv3 = getUniqueVertexIndex(v3, c3);

      if (!poly.inverseSide) {
        newIndices.push(iv0, iv1, iv3);
        newIndices.push(iv1, iv2, iv3);
      } else {
        newIndices.push(iv1, iv0, iv3);
        newIndices.push(iv1, iv3, iv2);
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
    geom.setIndex(new THREE.Uint16BufferAttribute(newIndices, 1));

    geom.computeVertexNormals();

    return geom;
  }, [part, isHighPoly]);

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      rotation-x={-Math.PI / 2}
      scale={10}
      position={[-10, 0, 15]}
    >
      <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default App;
