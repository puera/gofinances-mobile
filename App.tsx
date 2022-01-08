import React from 'react';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { ThemeProvider } from 'styled-components';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';
import { StatusBar } from 'react-native';
import theme from './src/global/styles/theme';

import { AuthContextProvider } from './src/context/AuthContext';
import { Routes } from './src/routes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <AppLoading />;

  return (
    <ThemeProvider theme={theme}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor={theme.colors.primary}
      />
      <AuthContextProvider>
        <Routes />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
