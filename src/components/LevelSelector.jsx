import React, { useState } from 'react';
import styles from './LevelSelector.module.scss';

export function LevelSelector({
    gameName,
    homeworlds,
    currentLevelPath,
    setCurrentLevelPath,
    toSnakeCase,
    isHighPoly,
    setIsHighPoly,
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
        <div className={styles.container}>
            <h2 className={styles.title}>Select a Level</h2>
            <div className={styles.controls}>
                <button
                    className={styles.polyToggle}
                    onClick={() => setIsHighPoly(!isHighPoly)}
                >
                    {isHighPoly ? 'Switch to Low Poly' : 'Switch to High Poly'}
                </button>
            </div>
            <div className={styles.homeworldsList}>
                {homeworlds.map((homeworld) => (
                    <div key={homeworld.name}>
                        <div
                            className={styles.homeworldHeader}
                            onClick={() => toggleHomeworld(homeworld.name)}
                        >
                            {homeworld.name}
                            <span className={styles.toggleIcon}>
                                {expandedHomeworlds[homeworld.name] ? '−' : '+'}
                            </span>
                        </div>
                        {expandedHomeworlds[homeworld.name] && (
                            <ul className={styles.levelsList}>
                                <li
                                    className={`${styles.levelItem} ${currentLevelPath?.includes(toSnakeCase(homeworld.name)) ? styles.active : ''
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
                                        className={`${styles.levelItem} ${currentLevelPath?.includes(toSnakeCase(level.name)) ? styles.active : ''
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
