import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { initializeApp } from "firebase/app";

// --- START FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAq08mBzxxNC-IrpzIq1vuHjmIAGmPYrGg",
  authDomain: "hypertension-app-dfcf5.firebaseapp.com",
  projectId: "hypertension-app-dfcf5",
  storageBucket: "hypertension-app-dfcf5.firebasestorage.app",
  messagingSenderId: "461065530132",
  appId: "1:461065530132:web:4916d5c75e0fe0cf667001"
};
// IMPORTANT: You must copy your real keys from your old firebaseConfig.js file here.

// Initialize Firebase and export it
export const firebaseApp = initializeApp(firebaseConfig);
// --- END FIREBASE CONFIG ---


// --- START THEME CONFIG ---
const lightTheme = {
  background: '#F7F9FC',
  text: '#1A202C',
  card: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#26A69A',
  primaryText: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabIcon: '#A0AEC0',
  tabIconActive: '#26A69A',
};

const darkTheme = {
  background: '#1A202C',
  text: '#E2E8F0',
  card: '#2D3748',
  border: '#4A5568',
  primary: '#81E6D9',
  primaryText: '#1A202C',
  tabBar: '#2D3748',
  tabIcon: '#A0AEC0',
  tabIconActive: '#FFFFFF',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme || 'light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // We are forcing dark mode as requested
  const colors = darkTheme; 
  const currentTheme = 'dark';

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, colors: colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
// --- END THEME CONFIG ---