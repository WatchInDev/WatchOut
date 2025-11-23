import Geocoding from 'react-native-geocoding';
import { Coordinates } from 'utils/types';

export const reverseGeocode = async (coordinates: Coordinates): Promise<string> => {
  try {
    const response = await Geocoding.from(coordinates.latitude, coordinates.longitude);

    if (response.results && response.results.length > 0) {
      const fullAddress = response.results[0].formatted_address;
      return fullAddress;
    } else {
      return "Nie znaleziono adresu dla tych współrzędnych.";
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Błąd połączenia z usługą geokodowania.";
  }
};