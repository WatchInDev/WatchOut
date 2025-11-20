import GooglePlacesTextInput, { GooglePlacesTextInputStyles } from 'react-native-google-places-textinput';
import { GOOGLE_API_KEY } from '@env';
import { Coordinates } from 'utils/types';
import { useState } from 'react';

type LocationTextInputProps = {
  onPlaceSelect: (coordinates: Coordinates) => void;
};

export const LocationTextInput = ({ onPlaceSelect }: LocationTextInputProps) => {
  const [value, setValue] = useState('');

  return (
  <GooglePlacesTextInput
    apiKey={GOOGLE_API_KEY}
    detailsFields={['displayName', 'location']}
    fetchDetails={true}
    scrollEnabled={false}
    nestedScrollEnabled={false}
    value={value}
    textContentType='location'
    style={styles}
    onPlaceSelect={(place) => {
      setValue(place.structuredFormat.mainText.text + ', ' + place.structuredFormat.secondaryText?.text);
      console.log('Place selected:', JSON.stringify(place, null, '\t'));
      onPlaceSelect({
        latitude: place.details?.location.latitude || 0,
        longitude: place.details?.location.longitude || 0,
      });
    }}
  />
  );
};

const styles: GooglePlacesTextInputStyles = {
  container: {
    width: '100%',
    marginVertical: 4,
  },
  input: {
    height: 56,
    borderWidth: 0.5,
    borderRadius: 4,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    main: {
      fontSize: 16,
      color: '#212121',
    },
    secondary: {
      fontSize: 14,
      color: '#757575',
    },
  },
  loadingIndicator: {
    color: '#6200EE',
  },
  placeholder: {
    color: '#9E9E9E',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  },
};
