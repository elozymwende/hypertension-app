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

export const firebaseApp = initializeApp(firebaseConfig);

// --- THEME CONFIG ---
const darkTheme = {
  background: '#1A202C',
  text: '#E2E8F0',
  card: '#2D3748',
  border: '#4A5568',
  primary: '#81E6D9',
  primaryText: '#1A202C',
  tabBar: '#2D3748',
  tabIcon: '#718096',
  tabIconActive: '#FFFFFF',
};

const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const colors = darkTheme; 
  const currentTheme = 'dark';
  const toggleTheme = () => {}; // Placeholder function

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, colors: colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export { ThemeProvider }; // Use a named export for the provider