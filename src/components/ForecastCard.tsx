
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatDay } from '@/services/weatherApi';
import WeatherIcon from './WeatherIcon';

interface ForecastCardProps {
  forecast: {
    date: string;
    day: {
      maxtemp_c: number;
      maxtemp_f: number;
      mintemp_c: number;
      mintemp_f: number;
      condition: {
        text: string;
        code: number;
      };
      daily_chance_of_rain: number;
    };
  };
  isCelsius: boolean;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, isCelsius }) => {
  return (
    <Card className="glassmorphism text-white p-3 flex flex-col items-center">
      <h3 className="font-medium">{formatDay(forecast.date)}</h3>
      <div className="my-2">
        <WeatherIcon conditionCode={forecast.day.condition.code} size={36} />
      </div>
      <p className="text-xs text-center mb-1">{forecast.day.condition.text}</p>
      <div className="flex justify-between w-full text-sm">
        <span>
          {isCelsius 
            ? `${Math.round(forecast.day.mintemp_c)}°` 
            : `${Math.round(forecast.day.mintemp_f)}°`}
        </span>
        <span>
          {isCelsius 
            ? `${Math.round(forecast.day.maxtemp_c)}°` 
            : `${Math.round(forecast.day.maxtemp_f)}°`}
        </span>
      </div>
      <div className="mt-1 text-xs flex items-center">
        <span>Rain: {forecast.day.daily_chance_of_rain}%</span>
      </div>
    </Card>
  );
};

export default ForecastCard;
