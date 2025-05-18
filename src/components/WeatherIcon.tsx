
import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Snowflake,
  Wind,
  Moon,
  CloudMoon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherIconProps {
  conditionCode: number;
  className?: string;
  size?: number;
  isDay?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  conditionCode, 
  className, 
  size = 64,
  isDay = true 
}) => {
  // Get appropriate icon based on condition code and time of day
  function getIcon() {
    // Weather condition codes from WeatherAPI.com
    if (conditionCode === 1000) {
      // Sunny/Clear
      return isDay 
        ? <Sun size={size} className="text-yellow-400 animate-pulse-slow" /> 
        : <Moon size={size} className="text-gray-200 animate-pulse-slow" />;
    } else if (conditionCode === 1003) {
      // Partly cloudy
      return isDay 
        ? <div className="relative">
            <Sun size={size} className="text-yellow-400 relative z-10 -mr-4" />
            <Cloud size={size} className="text-gray-300 ml-4 -mt-8" />
          </div>
        : <div className="relative">
            <Moon size={size} className="text-gray-200 relative z-10 -mr-4" />
            <Cloud size={size} className="text-gray-600 ml-4 -mt-8" />
          </div>;
    } else if (conditionCode >= 1006 && conditionCode <= 1009) {
      // Cloudy to overcast
      return <Cloud size={size} className="text-gray-300" />;
    } else if (conditionCode >= 1030 && conditionCode <= 1039) {
      // Mist/Fog
      return <CloudFog size={size} className="text-gray-300" />;
    } else if ((conditionCode >= 1063 && conditionCode <= 1069) || 
              (conditionCode >= 1150 && conditionCode <= 1171)) {
      // Light/moderate rain
      return <CloudDrizzle size={size} className="text-blue-300" />;
    } else if ((conditionCode >= 1180 && conditionCode <= 1195) ||
              (conditionCode >= 1240 && conditionCode <= 1246)) {
      // Heavy rain
      return <CloudRain size={size} className="text-blue-500" />;
    } else if ((conditionCode === 1087) || 
              (conditionCode >= 1273 && conditionCode <= 1282)) {
      // Thunder
      return <CloudLightning size={size} className="text-purple-400" />;
    } else if ((conditionCode >= 1066 && conditionCode <= 1072) ||
              (conditionCode >= 1114 && conditionCode <= 1117) || 
              (conditionCode >= 1204 && conditionCode <= 1237) ||
              (conditionCode >= 1249 && conditionCode <= 1264)) {
      // Snow/Sleet
      return <CloudSnow size={size} className="text-blue-100" />;
    } else if (conditionCode >= 1210 && conditionCode <= 1225) {
      // Heavy snow
      return <Snowflake size={size} className="text-blue-100 animate-spin-slow" />;
    }
    
    // Default or wind
    return <Wind size={size} className="text-gray-400" />;
  }

  return (
    <div className={cn("flex justify-center items-center", className)}>
      {getIcon()}
    </div>
  );
};

export default WeatherIcon;
