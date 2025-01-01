import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { KaitaiStream } from 'kaitai-struct';
import SpyroLevel from './kaitai/parsers/SpyroLevel';

function App() {
  const [gameData, setGameData] = useState(null);
  const [currentLevelPath, setCurrentLevelPath] = useState(null);
  const [level, setLevel] = useState(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        console.log('Fetching levels from: /levels/levels.json');
        const response = await fetch('/levels/levels.json');
        console.log('Response status:', response.status);
        const levelsData = await response.json();
        console.log('Levels data:', levelsData);
        setGameData(levelsData);

        // Set default level if available
        if (
          levelsData.homeworlds &&
          levelsData.homeworlds.length > 0 &&
          levelsData.homeworlds[0].levels &&
          levelsData.homeworlds[0].levels.length > 0
        ) {
          const gameName = levelsData.game_name.toLowerCase();
          const firstLevelNameSnake = toSnakeCase(levelsData.homeworlds[0].name);
          const path = `/levels/${gameName}/${firstLevelNameSnake}/sub1`;
          console.log('Setting default level path:', path);
          setCurrentLevelPath(path);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

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
      <Canvas
        style={{ width: '100vw', height: '100vh', background: '#222' }}
        camera={{ position: [0, 5, 15], fov: 60 }}
      >
        <OrbitControls />
        <ambientLight intensity={1.3} />
        {level &&
          level.partHeaders.map((part, index) => (
            <PartMesh key={index} part={part.body} />
          ))}
      </Canvas>
      {gameData && (
        <LevelSelector
          gameName={gameData.game_name}
          homeworlds={gameData.homeworlds}
          currentLevelPath={currentLevelPath}
          setCurrentLevelPath={setCurrentLevelPath}
          toSnakeCase={toSnakeCase}
        />
      )}
    </div>
  );
}

function LevelSelector({
  gameName,
  homeworlds,
  currentLevelPath,
  setCurrentLevelPath,
  toSnakeCase,
}) {
  const [expandedHomeworlds, setExpandedHomeworlds] = useState({});

  const toggleHomeworld = (name) => {
    setExpandedHomeworlds((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleLevelClick = (levelName) => {
    const gameNameLower = gameName.toLowerCase();
    const levelNameSnake = toSnakeCase(levelName);
    const path = `/levels/${gameNameLower}/${levelNameSnake}/sub1`;
    setCurrentLevelPath(path);
  };

  return (
    <div className="level-selector">
      <h2>Select a Level</h2>
      <div className="homeworlds">
        {homeworlds.map((homeworld) => (
          <div key={homeworld.name} className="homeworld">
            <div
              className="homeworld-header"
              onClick={() => toggleHomeworld(homeworld.name)}
            >
              {homeworld.name}
              <span className="toggle-icon">
                {expandedHomeworlds[homeworld.name] ? '-' : '+'}
              </span>
            </div>
            {expandedHomeworlds[homeworld.name] && (
              <ul className="levels-list">
                <li
                  className={
                    currentLevelPath.includes(toSnakeCase(homeworld.name))
                      ? 'active'
                      : ''
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(homeworld.name);
                  }}
                >
                  Homeworld
                </li>
                {homeworld.levels.map((level) => (
                  <li
                    key={level.name}
                    className={
                      currentLevelPath.includes(toSnakeCase(level.name))
                        ? 'active'
                        : ''
                    }
                    onClick={() => handleLevelClick(level.name)}
                  >
                    {level.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <style>
        {`
          .level-selector {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            width: 250px;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 1000;
          }

          .level-selector h2 {
            margin: 0;
            margin-bottom: 15px;
            font-size: 18px;
            text-align: center;
            border-bottom: 1px solid #555;
            padding-bottom: 5px;
          }

          .homeworlds {
            display: flex;
            flex-direction: column;
          }

          .homeworld {
            margin-bottom: 10px;
          }

          .homeworld-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: #333;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }

          .homeworld-header:hover {
            background: #444;
          }

          .toggle-icon {
            font-size: 18px;
            line-height: 1;
          }

          .levels-list {
            list-style: none;
            padding: 0;
            margin: 5px 0 0 0;
          }

          .levels-list li {
            padding: 6px 10px;
            margin: 4px 0;
            cursor: pointer;
            background: #555;
            border-radius: 4px;
            transition: background 0.3s;
          }

          .levels-list li:hover {
            background: #666;
          }

          .levels-list li.active {
            background: #777;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );
}

function PartMesh({ part }) {
  const geometry = useMemo(() => {
    if (!part) return null;

    const { highvertices, highvertColors, highpolys, highfarColors } = part;

    if (!highvertices || !highpolys) return null;
    if (highvertices.length === 0 || highpolys.length === 0) return null;

    const newPositions = [];
    const newColors = [];
    const newIndices = [];

    const vertexColorMap = {};

    const getUniqueVertexIndex = (vertexIndex, colorIndex) => {
      const key = `${vertexIndex}-${colorIndex}`;
      if (vertexColorMap[key] !== undefined) {
        return vertexColorMap[key];
      } else {
        const originalVertex = highvertices[vertexIndex];
        newPositions.push(originalVertex.x, originalVertex.y, originalVertex.z);

        const color = highfarColors[colorIndex];
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

    highpolys.forEach((poly) => {
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
  }, [part]);

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
