import { useEffect, useState } from 'react';
import { API_KEY, GEO_WEATHER_URL } from '../constants';
import { Geo, GeoResponse } from '../interfaces';

export default function useGeoLocation(location: string) {
  const [geo, setGeo] = useState<Geo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const URL = `${GEO_WEATHER_URL}?q=${location}&appid=${API_KEY}`;
  const getGeoLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(URL);

      if (!response.ok) throw new Error('Error fetching the geolocation data');

      const data = (await response.json()) as GeoResponse[];

      if (null == data || data.length === 0)
        throw new Error('The location provided does not exist');

      const geoData = data[0];

      const { lat, lon } = geoData;

      setGeo({ lat, lon });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);

        return;
      }

      setError('There was an error fetching the geolocation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGeoLocation();
  }, [location]);

  return {
    geo,
    error,
    isLoading,
  };
}
