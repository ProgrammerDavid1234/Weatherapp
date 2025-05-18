
import React from 'react';
import { Cloud, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative">
        <div className="flex items-center justify-center">
          <Cloud size={80} className="text-white/80 animate-pulse" />
          <CloudRain size={60} className="text-blue-300/80 animate-bounce ml-2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-transparent border-white/80 rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="mt-4 text-white/80 font-medium">Fetching weather data...</p>
    </div>
  );
};

export default LoadingState;
