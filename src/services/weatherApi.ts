interface WeatherData {
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
      icon: string;
      code: number;
    };
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    last_updated: string;
    precip_mm: number;
    pressure_mb: number;
    vis_km: number;
  };
  forecast?: {
    forecastday: ForecastDay[];
  };
}

interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    daily_chance_of_rain: number;
  };
  hour: Array<{
    time: string;
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
  }>;
}

// OpenMeteo API which doesn't require an API key
const BASE_URL = "https://api.open-meteo.com/v1";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1";

export async function fetchWeather(city: string, days: number = 1): Promise<WeatherData> {
  try {
    // Step 1: Get coordinates for the city
    const geoResponse = await fetch(
      `${GEO_URL}/search?name=${encodeURIComponent(city)}&count=1`
    );
    
    if (!geoResponse.ok) {
      throw new Error("Failed to find location");
    }
    
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location not found for: ${city}`);
    }
    
    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;
    
    // Step 2: Get weather data for the coordinates
    const weatherResponse = await fetch(
      `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,weathercode,visibility,windspeed_10m,winddirection_10m&hourly=temperature_2m,weathercode&forecast_days=${days}`
    );
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      throw new Error(`Weather API error: ${errorText}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    // Step 3: Transform data to match our interface
    return transformOpenMeteoData(weatherData, name, country, days);
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Weather data fetch failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred");
  }
}

function transformOpenMeteoData(apiData: any, cityName: string, country: string, days: number): WeatherData {
  const now = new Date();
  const lastUpdated = apiData.current.time || now.toISOString();
  
  // Map weather code to condition text and icons
  const currentCondition = mapWeatherCodeToCondition(apiData.current.weathercode);
  
  // Create forecast days
  const forecastDays: ForecastDay[] = [];
  for (let i = 0; i < days; i++) {
    const dayCondition = mapWeatherCodeToCondition(apiData.daily.weathercode[i]);
    
    const hourlyData = [];
    // Create 24 hourly forecasts for each day
    for (let h = i * 24; h < (i + 1) * 24; h++) {
      if (h < apiData.hourly.time.length) {
        const hourCondition = mapWeatherCodeToCondition(apiData.hourly.weathercode[h]);
        hourlyData.push({
          time: apiData.hourly.time[h],
          temp_c: apiData.hourly.temperature_2m[h],
          temp_f: celsiusToFahrenheit(apiData.hourly.temperature_2m[h]),
          condition: hourCondition
        });
      }
    }
    
    forecastDays.push({
      date: apiData.daily.time[i],
      date_epoch: new Date(apiData.daily.time[i]).getTime() / 1000,
      day: {
        maxtemp_c: apiData.daily.temperature_2m_max[i],
        maxtemp_f: celsiusToFahrenheit(apiData.daily.temperature_2m_max[i]),
        mintemp_c: apiData.daily.temperature_2m_min[i],
        mintemp_f: celsiusToFahrenheit(apiData.daily.temperature_2m_min[i]),
        avgtemp_c: (apiData.daily.temperature_2m_max[i] + apiData.daily.temperature_2m_min[i]) / 2,
        avgtemp_f: celsiusToFahrenheit((apiData.daily.temperature_2m_max[i] + apiData.daily.temperature_2m_min[i]) / 2),
        condition: dayCondition,
        daily_chance_of_rain: apiData.daily.precipitation_probability_max[i] || 0
      },
      hour: hourlyData
    });
  }

  // Create main weather data object
  return {
    location: {
      name: cityName,
      country: country,
      localtime: now.toISOString()
    },
    current: {
      temp_c: apiData.current.temperature_2m,
      temp_f: celsiusToFahrenheit(apiData.current.temperature_2m),
      condition: currentCondition,
      humidity: apiData.current.relative_humidity_2m,
      wind_kph: apiData.current.windspeed_10m,
      wind_dir: getWindDirection(apiData.current.winddirection_10m),
      feelslike_c: apiData.current.apparent_temperature,
      feelslike_f: celsiusToFahrenheit(apiData.current.apparent_temperature),
      uv: 0, // OpenMeteo doesn't provide UV directly
      last_updated: lastUpdated,
      precip_mm: apiData.current.precipitation || 0,
      pressure_mb: apiData.current.pressure_msl || 1013,
      vis_km: apiData.current.visibility / 1000 || 10, // Convert m to km
    },
    forecast: {
      forecastday: forecastDays
    }
  };
}

function mapWeatherCodeToCondition(code: number): { text: string; icon: string; code: number } {
  // WMO Weather interpretation codes from OpenMeteo
  // https://open-meteo.com/en/docs
  switch (code) {
    case 0:
      return { text: "Clear sky", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", code: 1000 };
    case 1:
      return { text: "Mainly clear", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", code: 1003 };
    case 2:
      return { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", code: 1003 };
    case 3:
      return { text: "Overcast", icon: "//cdn.weatherapi.com/weather/64x64/day/119.png", code: 1006 };
    case 45:
    case 48:
      return { text: "Fog", icon: "//cdn.weatherapi.com/weather/64x64/day/248.png", code: 1135 };
    case 51:
      return { text: "Light drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png", code: 1153 };
    case 53:
      return { text: "Moderate drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png", code: 1153 };
    case 55:
      return { text: "Dense drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png", code: 1153 };
    case 56:
    case 57:
      return { text: "Freezing drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/281.png", code: 1198 };
    case 61:
      return { text: "Slight rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png", code: 1183 };
    case 63:
      return { text: "Moderate rain", icon: "//cdn.weatherapi.com/weather/64x64/day/302.png", code: 1189 };
    case 65:
      return { text: "Heavy rain", icon: "//cdn.weatherapi.com/weather/64x64/day/308.png", code: 1195 };
    case 66:
    case 67:
      return { text: "Freezing rain", icon: "//cdn.weatherapi.com/weather/64x64/day/311.png", code: 1198 };
    case 71:
      return { text: "Slight snow", icon: "//cdn.weatherapi.com/weather/64x64/day/326.png", code: 1213 };
    case 73:
      return { text: "Moderate snow", icon: "//cdn.weatherapi.com/weather/64x64/day/329.png", code: 1216 };
    case 75:
    case 77:
      return { text: "Heavy snow", icon: "//cdn.weatherapi.com/weather/64x64/day/338.png", code: 1225 };
    case 80:
    case 81:
    case 82:
      return { text: "Rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/353.png", code: 1240 };
    case 85:
    case 86:
      return { text: "Snow showers", icon: "//cdn.weatherapi.com/weather/64x64/day/368.png", code: 1255 };
    case 95:
      return { text: "Thunderstorm", icon: "//cdn.weatherapi.com/weather/64x64/day/200.png", code: 1087 };
    case 96:
    case 99:
      return { text: "Thunderstorm with hail", icon: "//cdn.weatherapi.com/weather/64x64/day/389.png", code: 1276 };
    default:
      return { text: "Unknown", icon: "//cdn.weatherapi.com/weather/64x64/day/143.png", code: 1006 };
  }
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Keep the rest of the helper functions unchanged
export function getBackgroundClass(conditionCode: number, isDay: boolean = true): string {
  // Weather condition codes from WeatherAPI.com
  if (conditionCode === 1000) {
    // Sunny/Clear
    return isDay ? "weather-bg-sunny" : "weather-bg-clear-night";
  } else if (conditionCode >= 1003 && conditionCode <= 1009) {
    // Partly cloudy to cloudy
    return isDay ? "weather-bg-cloudy" : "weather-bg-cloudy-night";
  } else if (conditionCode >= 1030 && conditionCode <= 1039) {
    // Mist/Fog
    return "weather-bg-foggy";
  } else if ((conditionCode >= 1063 && conditionCode <= 1069) || 
             (conditionCode >= 1150 && conditionCode <= 1201)) {
    // Light rain to moderate rain
    return "weather-bg-rainy";
  } else if ((conditionCode >= 1087) || 
             (conditionCode >= 1273 && conditionCode <= 1282)) {
    // Thunder/Storm
    return "weather-bg-stormy";
  } else if ((conditionCode >= 1204 && conditionCode <= 1237) ||
             (conditionCode >= 1249 && conditionCode <= 1264)) {
    // Snow/Sleet/Ice
    return "weather-bg-snowy";
  }
  return "weather-bg-default";
}

export function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatDay(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short'
  }).format(date);
}
