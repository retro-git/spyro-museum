// levelselector.tsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

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

  const handleLevelClick = (levelName: string) => {
    const gameNameLower = gameName.toLowerCase();
    const levelNameSnake = toSnakeCase(levelName);
    const path = `/levels/${gameNameLower}/${levelNameSnake}/sub1`;
    setCurrentLevelPath(path);
  };

  return (
    <div className="absolute top-2.5 right-2.5 w-80 max-h-[90vh] z-[1000]">
      <Card className="bg-card/90 border-border backdrop-blur-sm">
        <CardContent className="space-y-3 pt-2">
        <CardHeader className="relative">
          <CardTitle className="text-lg text-center border-b pb-2">
            Select a Level
          </CardTitle>
          <div className="absolute top-0 right-0">
            <ModeToggle />
          </div>
        </CardHeader>
          {/* Settings Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Settings className="h-4 w-4" />
              <span>Display Settings</span>
            </div>
            
            <Button
              variant="default"
              size="sm"
              className="w-full border-border"
              onClick={() => setIsHighPoly(!isHighPoly)}
            >
              {isHighPoly ? 'Switch to Low Poly' : 'Switch to High Poly'}
            </Button>

            <Button
              variant="default"
              size="sm"
              className="w-full border-border disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setUseFarColors(!useFarColors)}
              disabled={!isHighPoly}
            >
              {useFarColors ? 'Use Vertex Colors' : 'Use Far Colors'}
            </Button>
          </div>



          {/* Levels Section */}
          <div className="space-y-2">
            <div className="h-[50vh] overflow-y-auto">
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
                        variant="default"
                        className="w-full justify-between font-semibold h-auto p-3"
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
                      <div className="space-y-1">
                        <Button
                          variant="default"
                          size="sm"
                          className={`w-full justify-center h-auto p-2 ${
                            currentLevelPath?.includes(toSnakeCase(homeworld.name))
                              ? 'bg-primary font-semibold'
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
                            variant="default"
                            size="sm"
                            className={`w-full justify-center h-auto p-2 ${
                              currentLevelPath?.includes(toSnakeCase(level.name))
                                ? 'bg-primary font-semibold'
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
