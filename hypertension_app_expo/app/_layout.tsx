import { Stack } from 'expo-router';
import { ThemeProvider } from './global.js';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A202C', // Dark header background
          },
          headerTintColor: '#FFFFFF', // Light header text/back button color
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Inter_700Bold', // Use our custom font in the header
          },
        }}
      >
        {/* These layouts manage their own headers/tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(doctor)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}