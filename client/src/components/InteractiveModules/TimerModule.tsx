import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleProps } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";

const TimerModule = ({ emotion, pageConfig }: ModuleProps) => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(5 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const theme = emotionMap[emotion];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(totalSeconds => totalSeconds - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsActive(false);
      setIsPaused(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, totalSeconds]);

  useEffect(() => {
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
  }, [totalSeconds]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTotalSeconds(5 * 60);
  };

  const handleDurationChange = (duration: string) => {
    const mins = parseInt(duration);
    setTotalSeconds(mins * 60);
    setIsActive(false);
    setIsPaused(false);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-6" style={{ borderColor: theme.primary }}>
      <CardHeader style={{ backgroundColor: theme.background }}>
        <CardTitle style={{ color: theme.text }}>Meditation Timer</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          {/* Timer Display */}
          <div className="space-y-4">
            <div 
              className="text-6xl font-bold"
              style={{ color: theme.primary }}
            >
              {formatTime(minutes, seconds)}
            </div>
            
            {/* Duration Selector */}
            <div className="flex justify-center">
              <Select onValueChange={handleDurationChange} disabled={isActive}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button
                onClick={handleStart}
                style={{ 
                  background: theme.gradient,
                  color: 'white',
                  border: 'none'
                }}
              >
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                style={{ borderColor: theme.primary }}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            
            <Button
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
          </div>

          {/* Session Status */}
          <div className="text-sm text-gray-600">
            {isActive && !isPaused && "Session in progress..."}
            {isPaused && "Session paused"}
            {!isActive && totalSeconds > 0 && "Ready to begin"}
            {totalSeconds === 0 && "Session complete! 🎉"}
          </div>

          {/* CTA */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => window.location.href = pageConfig.cta.link}
              style={{ 
                background: theme.gradient,
                color: 'white',
                border: 'none'
              }}
            >
              {pageConfig.cta.text}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimerModule;
