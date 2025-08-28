// levelselector.jsx

import React, { useState } from 'react';

export function LevelSelector({
    gameName,
    homeworlds,
    currentLevelPath,
    setCurrentLevelPath,
    toSnakeCase,
    isHighPoly,
    setIsHighPoly,
    useFarColors,
    setUseFarColors,
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
        <div className="absolute top-2.5 right-2.5 bg-black/80 text-white p-4 rounded-lg w-64 max-h-[90vh] overflow-y-auto z-[1000] backdrop-blur-sm">
            <h2 className="m-0 mb-4 text-lg text-center border-b border-gray-600 pb-1.5">Select a Level</h2>
            <div className="my-2.5 px-4">
                {/* Existing toggle for High/Low poly */}
                <button
                    className="w-full p-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200 mb-2"
                    onClick={() => setIsHighPoly(!isHighPoly)}
                >
                    {isHighPoly ? 'Switch to Low Poly' : 'Switch to High Poly'}
                </button>

                <button
                    className="w-full p-2 bg-gray-700 text-white border-none rounded cursor-pointer hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setUseFarColors(!useFarColors)}
                    disabled={!isHighPoly} // only enabled when high poly is selected
                >
                    {useFarColors ? 'Use Vertex Colors' : 'Use Far Colors'}
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {homeworlds.map((homeworld) => (
                    <div key={homeworld.name}>
                        <div
                            className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg cursor-pointer font-bold transition-colors duration-200 hover:bg-gray-700"
                            onClick={() => toggleHomeworld(homeworld.name)}
                        >
                            {homeworld.name}
                            <span className="text-lg leading-none w-5 text-center">
                                {expandedHomeworlds[homeworld.name] ? '−' : '+'}
                            </span>
                        </div>
                        {expandedHomeworlds[homeworld.name] && (
                            <ul className="list-none p-0 m-2 mt-0 flex flex-col gap-1">
                                <li
                                    className={`px-3 py-1.5 cursor-pointer bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:translate-x-1 ${
                                        currentLevelPath?.includes(toSnakeCase(homeworld.name))
                                            ? 'bg-gray-600 font-bold'
                                            : ''
                                    }`}
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
                                        className={`px-3 py-1.5 cursor-pointer bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-600 hover:translate-x-1 ${
                                            currentLevelPath?.includes(toSnakeCase(level.name))
                                                ? 'bg-gray-600 font-bold'
                                                : ''
                                        }`}
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
        </div>
    );
}
