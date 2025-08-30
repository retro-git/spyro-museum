// app.tsx

import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { KaitaiStream } from 'kaitai-struct';
import SpyroLevel from './kaitai/parsers/SpyroLevel';
import { LevelSelector } from './components/LevelSelector';
import { ThemeProvider } from './components/theme-provider';

// Type definitions
interface GameData {
  game_name: string;
  homeworlds: Array<{
    name: string;
    levels: Array<{ name: string }>;
  }>;
}

interface PartMeshProps {
  part: any; // Will be typed based on SpyroLevel structure
  isHighPoly: boolean;
  useFarColors: boolean;
}

interface LevelSelectorProps {
  gameName: string;
  homeworlds: Array<{ name: string }>;
  currentLevelPath: string | null;
  setCurrentLevelPath: (path: string) => void;
  toSnakeCase: (str: string) => string;
  isHighPoly: boolean;
  setIsHighPoly: (value: boolean) => void;
  useFarColors: boolean;
  setUseFarColors: (value: boolean) => void;
}

function LevelViewer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentLevelPath, setCurrentLevelPath] = useState<string | null>(null);
  const [level, setLevel] = useState<any>(null);

  // 1) Toggle for high vs. low poly
  const [isHighPoly, setIsHighPoly] = useState<boolean>(true);

  // 2) NEW: Toggle between `highfarColors` and `highvertColors`
  //    Defaults to `true` → `highfarColors` by default
  const [useFarColors, setUseFarColors] = useState<boolean>(true);

  // Extract the levelPath from the URL
  const levelPath = location.pathname.startsWith('/level/')
    ? location.pathname.replace('/level/', '')
    : '';

  // Modified handleLevelPathChange to update URL
  const handleLevelPathChange = (path: string) => {
    // Remove '/levels/' prefix and '/sub1' suffix for cleaner URLs
    const urlPath = path.replace('/levels/', '').replace('/sub1', '');
    console.log('Navigating to:', urlPath);
    navigate(`/level/${urlPath}`);
    setCurrentLevelPath(`/levels/${urlPath}/sub1`); // Keep sub1 for actual file path
  };

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await fetch('/levels/levels.json');
        const levelsData: GameData = await response.json();
        setGameData(levelsData);

        // If we have a levelPath from URL, use it
        if (levelPath) {
          // Make sure the levelPath includes both game and level names
          const pathParts = levelPath.split('/');
          if (pathParts.length === 1) {
            // If only the game name is provided, redirect to the first level
            const gameName = pathParts[0];
            const firstLevelNameSnake = toSnakeCase(levelsData.homeworlds[0].name);
            const fullPath = `/levels/${gameName}/${firstLevelNameSnake}/sub1`;
            handleLevelPathChange(fullPath);
          } else {
            console.log('Setting current level path from URL:', levelPath);
            setCurrentLevelPath(`/levels/${levelPath}/sub1`);
          }
        } else if (!currentLevelPath && !levelPath) {
          // Set default level if no URL path
          console.log('No level path provided, setting default level...');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelPath]);

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
  function toSnakeCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/'s/g, 's')  // Handle possessives
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  }

  return (
    <div className="container">
      <Canvas
        style={{ width: '100vw', height: '100vh', background: '#222' }}
        camera={{ position: [0, 5, 15], fov: 60 }}
      >
        <OrbitControls />
        <ambientLight intensity={1.3} />

        {level &&
          level.partHeaders.map((part: any, index: number) => (
            <PartMesh
              key={index}
              part={part.body}
              isHighPoly={isHighPoly}
              useFarColors={useFarColors}
            />
          ))}
      </Canvas>

      {gameData && (
        <LevelSelector
          gameName={gameData.game_name}
          homeworlds={gameData.homeworlds}
          currentLevelPath={currentLevelPath}
          setCurrentLevelPath={handleLevelPathChange}
          toSnakeCase={toSnakeCase}
          // Existing props for poly toggle
          isHighPoly={isHighPoly}
          setIsHighPoly={setIsHighPoly}
          // NEW: pass the far-colors toggle down
          useFarColors={useFarColors}
          setUseFarColors={setUseFarColors}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LevelViewer />} />
          <Route path="/level/*" element={<LevelViewer />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

/**
 * PartMesh component
 * This component handles rendering the geometry for a given "part."
 * It checks whether to use high or low poly, and also whether to use
 * normal or "far" colors if high poly is active.
 */
function PartMesh({ part, isHighPoly, useFarColors }: PartMeshProps) {
  const geometry = useMemo(() => {
    if (!part) return null;

    // Select vertices and polys based on high or low poly
    const vertices = isHighPoly ? part.highvertices : part.lowvertices;
    const polys = isHighPoly ? part.highpolys : part.lowpolys;

    // Decide which color array to use
    // - For high poly: if "useFarColors" is true, use highfarColors; otherwise use highvertColors
    // - For low poly: there's only lowvertColors
    let colors;
    if (isHighPoly) {
      colors = useFarColors ? part.highfarColors : part.highvertColors;
    } else {
      colors = part.lowvertColors;
    }

    // Sanity checks
    if (!vertices || !polys || !colors) return null;
    if (vertices.length === 0 || polys.length === 0) return null;

    const newPositions: number[] = [];
    const newColors: number[] = [];
    const newIndices: number[] = [];

    // We'll store a map to handle duplicates of vertex+color combos
    const vertexColorMap: Record<string, number> = {};

    const getUniqueVertexIndex = (vertexIndex: number, colorIndex: number): number => {
      const key = `${vertexIndex}-${colorIndex}`;
      if (vertexColorMap[key] !== undefined) {
        return vertexColorMap[key];
      } else {
        const originalVertex = vertices[vertexIndex];
        newPositions.push(originalVertex.x, originalVertex.y, originalVertex.z);

        const color = colors[colorIndex];
        // Example gamma correction or just scale as you like
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

    polys.forEach((poly: any) => {
      const { v0, v1, v2, v3 } = poly.vert;
      const { c0, c1, c2, c3 } = poly.color;

      const iv0 = getUniqueVertexIndex(v0, c0);
      const iv1 = getUniqueVertexIndex(v1, c1);
      const iv2 = getUniqueVertexIndex(v2, c2);
      const iv3 = getUniqueVertexIndex(v3, c3);

      if (isHighPoly) {
        // If poly.inverseSide is false, we do one winding order
        // If true, we invert it
        if (!poly.inverseSide) {
          newIndices.push(iv0, iv1, iv3);
          newIndices.push(iv1, iv2, iv3);
        } else {
          newIndices.push(iv1, iv0, iv3);
          newIndices.push(iv1, iv3, iv2);
        }
      } else {
        // Low poly always uses this winding order
        newIndices.push(iv1, iv0, iv2);
        newIndices.push(iv1, iv2, iv3);
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(newColors, 3));
    geom.setIndex(new THREE.Uint16BufferAttribute(newIndices, 1));

    geom.computeVertexNormals();

    return geom;
  }, [part, isHighPoly, useFarColors]);

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
