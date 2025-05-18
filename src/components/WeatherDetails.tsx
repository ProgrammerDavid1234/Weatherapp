
import React from 'react';
import { Card } from '@/components/ui/card';
import { Droplets, Wind, Thermometer, ArrowUpCircle, Gauge, Eye } from 'lucide-react';

interface WeatherDetailsProps {
  current: {
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    uv: number;
    pressure_mb: number;
    vis_km: number;
    precip_mm: number;
  };
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ current }) => {
  return (
    <Card className="glassmorphism text-white p-4 w-full">
      <h3 className="text-lg font-semibold mb-3">Weather Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-200" />
          <div>
            <p className="text-white/80 text-xs">Humidity</p>
            <p className="font-medium">{current.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind size={18} className="text-blue-200" />
          <div>
            <p className="text-white/80 text-xs">Wind</p>
            <p className="font-medium">{current.wind_kph} km/h {current.wind_dir}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-blue-200" />
          <div>
            <p className="text-white/80 text-xs">Pressure</p>
            <p className="font-medium">{current.pressure_mb} mb</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpCircle size={18} className="text-yellow-200" />
          <div>
            <p className="text-white/80 text-xs">UV Index</p>
            <p className="font-medium">{current.uv}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye size={18} className="text-blue-200" />
          <div>
            <p className="text-white/80 text-xs">Visibility</p>
            <p className="font-medium">{current.vis_km} km</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-300" />
          <div>
            <p className="text-white/80 text-xs">Precipitation</p>
            <p className="font-medium">{current.precip_mm} mm</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherDetails;
