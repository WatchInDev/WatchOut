import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { useTokenAdd } from './useTokenAdd';

async function retrieveNotificationPermission(): Promise<Notifications.PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return existingStatus;

  const { status: rerequestedStatus } = await Notifications.requestPermissionsAsync();
  return rerequestedStatus;
}

async function areNotificationsAvailableAsync(): Promise<
  { projectId: string } | { error: string }
> {
  if (!Device.isDevice) {
    return { error: 'Must use physical device for push notifications' };
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) {
    return { error: 'Expo project ID is not defined in app configuration' };
  }
  return { projectId };
}

async function registerForPushNotificationsAsync(
  projectId: string
): Promise<{ token: string } | { error: string }> {
  try {
    return {
      token: (await Notifications.getExpoPushTokenAsync({ projectId })).data,
    };
  } catch (e: unknown) {
    return { error: (e as Error).message || 'Failed to get push token for push notification!' };
  }
}

function handleRegistrationError(errorMessage: string) {
  console.error('Error occurring notification setup:', errorMessage);
  alert('Coś poszło nie tak podczas rejestracji do powiadomień push! Spróbuj ponownie później.');
  throw new Error(errorMessage);
}

export const useNotifications = () => {
  const { mutate: uploadToken } = useTokenAdd();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    async function registerForPushNotifications() {
      const availability = await areNotificationsAvailableAsync();
      if ('error' in availability) {
        handleRegistrationError(availability.error);
        return;
      }
      const permissionStatus = await retrieveNotificationPermission();
      if (permissionStatus !== 'granted') {
        handleRegistrationError('Notification permissions not granted');
        return;
      }

      const token = await registerForPushNotificationsAsync(availability.projectId);
      if ('error' in token) {
        handleRegistrationError(token.error);
        return;
      }

      console.log('Registered for push notifications with token:', token);
      uploadToken({ tokenFCM: token.token });
    }

    registerForPushNotifications();
  }, [uploadToken]);
};
