
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { formatTime, formatDate } from '@/services/weatherApi';
import WeatherIcon from './WeatherIcon';
import { MapPin, ThermometerSun } from 'lucide-react';

interface WeatherCardProps {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      code: number;
    };
    feelslike_c: number;
    feelslike_f: number;
    last_updated: string;
  };
  isCelsius: boolean;
  toggleUnit: () => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, current, isCelsius, toggleUnit }) => {
  return (
    <Card className="w-full max-w-lg glassmorphism text-white relative overflow-hidden">
      <div className="p-6 flex flex-col gap-4">
        {/* Header - Location and Date */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <MapPin size={18} className="text-white/90" />
              <h2 className="text-2xl font-bold">{location.name}</h2>
            </div>
            <p className="text-white/90">{location.country}</p>
            <p className="text-xs text-white/70 mt-1">{formatDate(location.localtime)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">°F</span>
            <Switch 
              checked={isCelsius} 
              onCheckedChange={toggleUnit}
              className="data-[state=checked]:bg-white/50 data-[state=unchecked]:bg-white/30"
            />
            <span className="text-sm">°C</span>
          </div>
        </div>

        {/* Main weather info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-6xl font-bold">
              {isCelsius ? `${Math.round(current.temp_c)}°C` : `${Math.round(current.temp_f)}°F`}
            </span>
            <span className="text-white/90 flex items-center gap-1 mt-1">
              <ThermometerSun size={14} />
              Feels like {isCelsius ? `${Math.round(current.feelslike_c)}°C` : `${Math.round(current.feelslike_f)}°F`}
            </span>
          </div>
          
          <div className="flex flex-col items-center relative">
            <WeatherIcon conditionCode={current.condition.code} size={80} />
            <span className="text-lg font-medium text-center">{current.condition.text}</span>
          </div>
        </div>

        <Separator className="bg-white/20 my-2" />

        {/* Last updated */}
        <div className="text-right">
          <p className="text-xs text-white/70">Last updated: {formatTime(current.last_updated)}</p>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;
