// levelselector.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface Homeworld {
  name: string;
  levels: Array<{ name: string }>;
}

interface LevelSelectorProps {
  gameName: string;
  homeworlds: Homeworld[];
  currentLevelPath: string | null;
  setCurrentLevelPath: (path: string) => void;
  toSnakeCase: (str: string) => string;
  isHighPoly: boolean;
  setIsHighPoly: (value: boolean) => void;
  useFarColors: boolean;
  setUseFarColors: (value: boolean) => void;
}

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
}: LevelSelectorProps) {
  const [expandedHomeworlds, setExpandedHomeworlds] = useState<Record<string, boolean>>({});

  const toggleHomeworld = (name: string) => {
    setExpandedHomeworlds((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleLevelClick = (levelName: string) => {
    const gameNameLower = gameName.toLowerCase();
    const levelNameSnake = toSnakeCase(levelName);
    const path = `/levels/${gameNameLower}/${levelNameSnake}/sub1`;
    setCurrentLevelPath(path);
  };

  return (
    <div className="absolute top-2.5 right-2.5 w-80 max-h-[90vh] z-[1000]">
      <Card className="bg-black/90 text-white border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center text-white border-b border-gray-600 pb-2">
            Select a Level
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-2">
          {/* Settings Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Settings className="h-4 w-4" />
              <span>Display Settings</span>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              onClick={() => setIsHighPoly(!isHighPoly)}
            >
              {isHighPoly ? 'Switch to Low Poly' : 'Switch to High Poly'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setUseFarColors(!useFarColors)}
              disabled={!isHighPoly}
            >
              {useFarColors ? 'Use Vertex Colors' : 'Use Far Colors'}
            </Button>
          </div>

          <Separator className="bg-gray-600" />

          {/* Levels Section */}
          <div className="space-y-2">
            <div className="h-[60vh] overflow-y-auto pr-4">
              <div className="space-y-2">
                {homeworlds.map((homeworld) => (
                  <Collapsible
                    key={homeworld.name}
                    open={expandedHomeworlds[homeworld.name]}
                    onOpenChange={(open) => 
                      setExpandedHomeworlds((prev) => ({
                        ...prev,
                        [homeworld.name]: open,
                      }))
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between bg-gray-800 hover:bg-gray-700 text-white font-semibold h-auto p-3"
                      >
                        <span>{homeworld.name}</span>
                        {expandedHomeworlds[homeworld.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1 mt-2">
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-center bg-gray-700 hover:bg-gray-600 text-white h-auto p-2 ${
                            currentLevelPath?.includes(toSnakeCase(homeworld.name))
                              ? 'bg-gray-600 font-semibold'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLevelClick(homeworld.name);
                          }}
                        >
                          Homeworld
                        </Button>
                        
                        {homeworld.levels.map((level) => (
                          <Button
                            key={level.name}
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-center bg-gray-700 hover:bg-gray-600 text-white h-auto p-2 ${
                              currentLevelPath?.includes(toSnakeCase(level.name))
                                ? 'bg-gray-600 font-semibold'
                                : ''
                            }`}
                            onClick={() => handleLevelClick(level.name)}
                          >
                            {level.name}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
