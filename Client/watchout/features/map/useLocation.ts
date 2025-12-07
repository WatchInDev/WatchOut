import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from '@react-native-community/geolocation';

const isUserLocationGranted = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Watchout needs access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const useUserLocation = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRequest = async () => {
      let permissionGranted = false;
      if (Platform.OS === 'android') {
        const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (checkResult) {
          permissionGranted = true;
        } else {
          permissionGranted = await isUserLocationGranted();
        }
      } else {
        permissionGranted = true;
      }
      setHasPermission(permissionGranted);

      if (permissionGranted) {
        Geolocation.getCurrentPosition(
          (position) => {
            setLocation(position.coords);
          },
          (err) => {
            setError(err.message);
          }
        );
      }
      setLoading(false);
    };
    checkAndRequest();
  }, []);

  return { hasPermission, location, error, loading };
};