import GooglePlacesTextInput, {
  GooglePlacesTextInputStyles,
} from 'react-native-google-places-textinput';
import { GOOGLE_API_KEY } from '@env';
import { Coordinates } from 'utils/types';
import { useEffect, useState } from 'react';
import { theme } from 'utils/theme';
import { Text } from 'components/Base/Text';

type LocationTextInputProps = {
  initialValue?: string;
  onPlaceSelect: (coordinates: Coordinates) => void;
  editable?: boolean;
  error?: string;
};

export const LocationTextInput = ({
  initialValue,
  onPlaceSelect,
  editable,
  error,
}: LocationTextInputProps) => {
  const [value, setValue] = useState(initialValue ?? '');

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  return (
    <>
      <GooglePlacesTextInput
        apiKey={GOOGLE_API_KEY}
        editable={editable ?? true}
        detailsFields={['displayName', 'location']}
        fetchDetails={true}
        placeHolderText='Wpisz adres lokalizacji'
        scrollEnabled={false}
        nestedScrollEnabled={false}
        value={value}
        textContentType="location"
        style={
          !error
            ? styles
            : {
                ...styles,
                input: {
                  ...(styles.input as object),
                  borderColor: theme.palette.error,
                  borderWidth: 1.5,
                },
              }
        }
        debounceDelay={750}
        onPlaceSelect={(place) => {
          setValue(
            place.structuredFormat.mainText.text + ', ' + place.structuredFormat.secondaryText?.text
          );
          onPlaceSelect({
            latitude: place.details?.location.latitude || 0,
            longitude: place.details?.location.longitude || 0,
          });
        }}
      />
      {error && (
        <Text style={{ color: theme.palette.error, marginTop: 0, marginLeft: 4 }}>{error}</Text>
      )}
    </>
  );
};

const styles: GooglePlacesTextInputStyles = {
  container: {
    width: '100%',
    marginVertical: 4,
  },
  input: {
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    fontSize: 16,
    paddingVertical: 12,
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
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
      fontFamily: 'Poppins_400Regular',
      fontSize: 16,
      lineHeight: 16,
      color: '#212121',
    },
    secondary: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 14,
      lineHeight: 14,
      color: '#757575',
    },
  },
  loadingIndicator: {
    color: theme.palette.primary,
  },
  placeholder: {
    color: '#9E9E9E',
  },
};
