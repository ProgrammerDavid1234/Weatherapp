
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularCities] = useState([
    'London', 'New York', 'Tokyo', 'Paris', 'Sydney',
    'Berlin', 'Rome', 'Madrid', 'Toronto', 'Singapore'
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (city.trim()) {
      const filtered = popularCities.filter(c => 
        c.toLowerCase().startsWith(city.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [city, popularCities]);

  const handleSuggestionClick = (suggestion: string) => {
    setCity(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white/70 backdrop-blur-sm border-transparent focus:border-white pl-9 pr-4 text-gray-800"
            disabled={isLoading}
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !city.trim()}
          className="bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white border border-white/20"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </form>
      
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
