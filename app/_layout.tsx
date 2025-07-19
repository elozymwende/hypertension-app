import { Stack } from 'expo-router';
import { ThemeProvider } from './global.js';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native'; 

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
   
          headerTitle: ({ children }) => {
            return (
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: 'Inter_700Bold',
                  textTransform: 'uppercase',
                }}
              >
                {children}
              </Text>
            );
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(doctor)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}