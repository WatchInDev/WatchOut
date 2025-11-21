import { Coordinates } from '../../utils/types';

export const reverseGeocode = async (
  coordinates: Coordinates,
  apiKey?: string
): Promise<string> => {
  const key = apiKey ?? process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('Google Maps API key is required (pass as parameter or set REACT_APP_GOOGLE_MAPS_API_KEY).');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
    `${coordinates.latitude},${coordinates.longitude}`
  )}&key=${encodeURIComponent(key)}&language=pl`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);

    const data = await res.json();

    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    if (data.status === 'ZERO_RESULTS') {
      return 'Nie znaleziono adresu dla tych współrzędnych.';
    }

    console.error('Geocoding unexpected status:', data.status, data);
    return 'Błąd połączenia z usługą geokodowania.';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Błąd połączenia z usługą geokodowania.';
  }
};