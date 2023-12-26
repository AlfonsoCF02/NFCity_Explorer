// App.js
import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './src/navigation/Navigator';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';
import { NfcData } from './src/types/nfcTypes'; // Asegúrate de que la ruta de importación sea correcta


// Importa los datos NFC, asegurándote de que la ruta sea correcta
import rawData from './src/data/nfcData.json';
const nfcData: NfcData = rawData as NfcData;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

/*  COMO NO FUNCIONA EL NFC EN EL EMULADOR COMENTAR

  useEffect(() => {
    async function initNfc() {
      const supported = await NfcManager.isSupported();
      if (supported) {
        const enabled = await NfcManager.isEnabled();
        if (!enabled) {
          // NFC está soportado pero no activado
          Alert.alert(
            "NFC is not enabled",
            "Please enable NFC to use this application.",
            [
              // Opcionalmente, puedes dirigir al usuario a la configuración de NFC
              { text: "Go to Settings", onPress: () => NfcManager.goToNfcSetting() },
              { text: "OK" }
            ]
          );
        } else {
          // NFC está activado y listo para usarse
          NfcManager.start();
        }
      } else {
        // NFC no está soportado
        Alert.alert("NFC not supported", "This device doesn't support NFC.");
      }
    }

    initNfc();

    NfcManager.setEventListener(NfcEvents.DiscoverTag, (event: any) => {
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
    });

    // Limpiar el listener al desmontar
    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, []);

*/

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
