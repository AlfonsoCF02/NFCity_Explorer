/**
 * NFCity_Explorer App
 * https://github.com/tu-usuario-de-github/NFCity_Explorer
 */

import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';

// Importación de la navegación y las pantallas
import Navigator from './src/navigation/Navigator';

function App(): React.ReactElement {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#FFF', // Colores simplificados
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Navigator />
    </SafeAreaView>
  );
}

export default App;
