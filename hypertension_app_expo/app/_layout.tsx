import { Slot } from 'expo-router';
import { ThemeProvider } from './global.js';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// This setting is required for notifications to show up while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // --- ADD THIS PERMISSION LOGIC ---
  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
      }
    }
    requestPermissions();
  }, []);
  // --------------------------------

  if (!fontsLoaded) {
    return <View />;
  }

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}