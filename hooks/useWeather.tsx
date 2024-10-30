import { useEffect, useState } from 'react';
import { CurrentWeather, ForecastWeather, WeatherData } from '../interfaces';
import { CURRENT_WEATHER_URL, FORECAST_WEATHER_URL, API_KEY } from '../constants';
import useGeoLocation from './useGeo';

const INITIAL_WEATHER_VALUES: WeatherData = {
  current: null,
  forecast: null,
};

export default function useWeather(location: string) {
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { geo, isLoading: isGeoLoading, error: geoError } = useGeoLocation(location);

  console.log({ geo, isGeoLoading, geoError, weather });
  const getWeather = async () => {
    if (null == geo) return;

    const { lat, lon } = geo;

    setError(null);
    setIsLoading(true);

    const currentURL = `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const forecastURL = `${FORECAST_WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const URLs = [fetch(currentURL), fetch(forecastURL)];

    try {
      const responses = await Promise.all(URLs);
      const ok = responses.every((response) => response.ok);

      if (!ok) throw new Error('There was an error fething the weather data');

      const [current, forecast] = await Promise.all<CurrentWeather | ForecastWeather>(
        responses.map((response) => response.json())
      );

      setWeather({ current: current as CurrentWeather, forecast: forecast as ForecastWeather });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);

        return;
      }
      setError('Error fetching the weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
  }, [geo]);

  console.log({ isGeoLoading, isLoading });

  return {
    weather,
    error: error || geoError,
    isLoading: isLoading || isGeoLoading,
  };
}
