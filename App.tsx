// App.js
import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './src/navigation/Navigator';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';

// Tipos para los datos de NFC, asumiendo que tus claves son números en forma de string
interface NfcData {
  [key: string]: string;
}

// Importa los datos NFC, asegurándote de que la ruta sea correcta
import rawData from './src/data/nfcData.json';
const nfcData: NfcData = rawData as NfcData;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    NfcManager.start();

    const handleNfcRead = (event: any) => {
      const ndefRecords = event.ndefMessage;
      if (ndefRecords) {
        const id = Ndef.text.decodePayload(ndefRecords[0].payload);
        const description = nfcData[id];
        if (description) {
          Alert.alert('NFC Tag ID', `ID: ${id}`, [
            { text: 'OK' },
            { text: 'Show Description', onPress: () => Alert.alert('Description', description) },
          ]);
        } else {
          Alert.alert('NFC Tag ID', 'No description found for this tag.');
        }
      }
    };

    // Suscribirse al evento de lectura NFC
    NfcManager.setEventListener(NfcEvents.DiscoverTag, handleNfcRead);

    // Limpiar el listener al desmontar
    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      // Si la función stop existe, usarla, de lo contrario comentar la siguiente línea
      // NfcManager.stop();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#333' : '#FFF' }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;

