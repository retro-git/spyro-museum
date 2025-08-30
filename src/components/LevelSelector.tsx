// levelselector.tsx

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronRight, Settings, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
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
  onFileUpload: (file: File) => void;
  uploadStatus: 'idle' | 'loading' | 'success' | 'error';
  isCustomLevel: boolean;
  uploadedFileName?: string;
  showUploadedLevel: boolean;
  setShowUploadedLevel: (value: boolean) => void;
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
  onFileUpload,
  uploadStatus,
  isCustomLevel,
  uploadedFileName,
  showUploadedLevel,
  setShowUploadedLevel,
}: LevelSelectorProps) {
  const [expandedHomeworlds, setExpandedHomeworlds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLevelClick = (levelName: string) => {
    const gameNameLower = gameName.toLowerCase();
    const levelNameSnake = toSnakeCase(levelName);
    const path = `/levels/${gameNameLower}/${levelNameSnake}/sub1`;
    setCurrentLevelPath(path);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getLevelButtonClassName = (levelName: string) => {
    return `w-full justify-center h-auto p-2 ${
      currentLevelPath?.includes(toSnakeCase(levelName))
        ? 'bg-primary font-semibold'
        : ''
    }`;
  };

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'loading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'loading':
        return 'Parsing file...';
      case 'success':
        return 'File loaded!';
      case 'error':
        return 'Failed to parse file';
      default:
        return 'Upload Level File';
    }
  };

  return (
    <div className="absolute top-2.5 right-2.5 w-80 max-h-[90vh] z-[1000]">
      <Card className="bg-card/90 border-border backdrop-blur-none">
        <CardContent className="space-y-3 pt-2">
        <CardHeader className="relative">
          <CardTitle className="text-lg text-center border-b pb-2">
            Select a Level
          </CardTitle>
          <div className="absolute top-0 right-0">
            <ModeToggle />
          </div>
        </CardHeader>

          {/* File Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <FileText className="h-4 w-4" />
              <span>Custom Level</span>
            </div>
            
            <div className="flex gap-2 min-w-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-[7] border-border hover:bg-accent min-w-0"
                onClick={triggerFileInput}
                disabled={uploadStatus === 'loading'}
              >
                <div className="flex items-center min-w-0">
                  {getUploadStatusIcon()}
                  <span className="ml-2 truncate">{getUploadStatusText()}</span>
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-[3] border-border min-w-0"
                onClick={() => setShowUploadedLevel(!showUploadedLevel)}
                disabled={!isCustomLevel}
              >
                <span className="truncate">{showUploadedLevel ? 'URL' : 'Uploaded'}</span>
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload status and toggle */}
            {uploadStatus === 'error' && (
              <div className="text-xs text-red-500 text-center p-2 bg-red-500/10 rounded-md border border-red-500/20">
                <div className="font-medium mb-1">Failed to parse file</div>
                <div>Please ensure the file is a valid Spyro level format</div>
                <div className="text-xs mt-1">Max file size: 10MB</div>
              </div>
            )}

            {/* Toggle between uploaded and URL level */}
            {isCustomLevel && uploadedFileName && (
              <div className="text-xs text-muted-foreground text-center truncate">
                {uploadedFileName}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Settings className="h-4 w-4" />
              <span>Display Settings</span>
            </div>
            
            <div className="flex gap-2 min-w-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border min-w-0"
                onClick={() => setIsHighPoly(!isHighPoly)}
              >
                <span className="truncate">{isHighPoly ? 'Low Poly' : 'High Poly'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-border disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
                onClick={() => setUseFarColors(!useFarColors)}
                disabled={!isHighPoly}
              >
                <span className="truncate">{useFarColors ? 'Vertex' : 'Far'}</span>
              </Button>
            </div>
          </div>

          {/* Levels Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Predefined Levels</span>
            </div>
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
                        variant="outline"
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
                          variant="outline"
                          size="sm"
                          className={getLevelButtonClassName(homeworld.name)}
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
                            variant="outline"
                            size="sm"
                            className={getLevelButtonClassName(level.name)}
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
