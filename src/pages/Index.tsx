
import React, { useState, useEffect } from 'react';
import { fetchWeather, getBackgroundClass } from '@/services/weatherApi';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from '@/components/SearchBar';
import WeatherCard from '@/components/WeatherCard';
import LoadingState from '@/components/LoadingState';
import ForecastCard from '@/components/ForecastCard';
import WeatherDetails from '@/components/WeatherDetails';
import { BookmarkPlus, BookmarkCheck, History } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);
  const [bgClass, setBgClass] = useState('weather-bg-default');
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Initialize with user's location or default city
  useEffect(() => {
    const savedCity = localStorage.getItem('lastSearchedCity');
    if (savedCity) {
      handleSearch(savedCity);
    } else {
      handleSearch('London');
    }

    // Load search history
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    
    // Load saved locations
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (city: string) => {
    setLoading(true);
    try {
      const data = await fetchWeather(city, 5); // Get 5-day forecast
      setWeatherData(data);
      setCurrentLocation(city);
      
      // Set background based on weather condition
      setBgClass(getBackgroundClass(data.current.condition.code));
      
      // Save to localStorage
      localStorage.setItem('lastSearchedCity', city);
      
      // Update search history
      const updatedHistory = [city, ...searchHistory.filter(item => item !== city)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      
      console.log('Weather data:', data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const toggleSaveLocation = () => {
    if (!currentLocation) return;
    
    if (savedLocations.includes(currentLocation)) {
      // Remove from saved locations
      const updated = savedLocations.filter(loc => loc !== currentLocation);
      setSavedLocations(updated);
      localStorage.setItem('savedLocations', JSON.stringify(updated));
      toast({
        title: "Location Removed",
        description: `${currentLocation} has been removed from saved locations`,
      });
    } else {
      // Add to saved locations
      const updated = [...savedLocations, currentLocation];
      setSavedLocations(updated);
      localStorage.setItem('savedLocations', JSON.stringify(updated));
      toast({
        title: "Location Saved",
        description: `${currentLocation} has been added to saved locations`,
      });
    }
  };

  const isLocationSaved = currentLocation && savedLocations.includes(currentLocation);

  return (
    <div className={`min-h-screen flex flex-col items-center transition-all duration-500 ${bgClass}`}>
      <div className="w-full max-w-5xl px-4 py-8 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Weather Forecast</h1>
          <p className="text-white/80">Get accurate weather forecasts for any location</p>
        </div>
        
        <div className="flex justify-center mb-6 relative">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
          {weatherData && (
            <button 
              onClick={toggleSaveLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
              title={isLocationSaved ? "Remove from saved locations" : "Save location"}
            >
              {isLocationSaved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <BookmarkPlus className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        
        {/* Saved locations and history */}
        {(savedLocations.length > 0 || searchHistory.length > 0) && (
          <div className="mb-6">
            <Tabs defaultValue="saved" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/20 text-white">
                <TabsTrigger value="saved">Saved Locations</TabsTrigger>
                <TabsTrigger value="history">Recent Searches</TabsTrigger>
              </TabsList>
              <TabsContent value="saved">
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {savedLocations.length > 0 ? (
                    savedLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleSearch(location)}
                        className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {location}
                      </button>
                    ))
                  ) : (
                    <p className="text-white/80 text-sm">No saved locations yet</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {searchHistory.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleSearch(location)}
                      className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <History size={12} />
                      {location}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <div className="flex justify-center">
          {loading ? (
            <LoadingState />
          ) : weatherData ? (
            <div className="w-full flex flex-col gap-6">
              {/* Main Weather Card */}
              <WeatherCard 
                location={weatherData.location} 
                current={weatherData.current}
                isCelsius={isCelsius}
                toggleUnit={toggleTemperatureUnit}
              />
              
              {/* Weather Details */}
              <WeatherDetails current={weatherData.current} />
              
              {/* 5-day Forecast */}
              {weatherData.forecast && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-white mb-3">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {weatherData.forecast.forecastday.map((day: any) => (
                      <ForecastCard 
                        key={day.date} 
                        forecast={day}
                        isCelsius={isCelsius}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glassmorphism p-10 rounded-lg text-white text-center">
              <p>Enter a city name to see the weather forecast</p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-auto py-4 text-white/70 text-sm text-center">
        <p>Data provided by WeatherAPI.com</p>
      </footer>
    </div>
  );
};

export default Index;
