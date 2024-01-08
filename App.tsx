import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './src/navigation/Navigator';
import NfcManager, { NfcEvents, Ndef } from 'react-native-nfc-manager';

// Importa los datos NFC, asegurándote de que la ruta sea correcta
import rawData from './src/data/nfcData.json';
const nfcData: { [key: string]: string } = rawData as { [key: string]: string };


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

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
        await NfcManager.start();
        // Escuchar continuamente los tags NFC
        NfcManager.setEventListener(NfcEvents.DiscoverTag, handleNfcRead);
        NfcManager.registerTagEvent();
      } else {
        Alert.alert("NFC not supported", "This device doesn't support NFC.");
      }
    }

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent();
    };
  }, []);

  const handleNfcRead = (tag:any) => {
    try {
      const ndefRecords = tag.ndefMessage;

      if (ndefRecords && ndefRecords.length > 0) {
        let payloadBytes = ndefRecords[0].payload;

        if (payloadBytes) {
          let payloadText = Ndef.text.decodePayload(payloadBytes);
          // Mostrar el texto del payload y buscar en nfcData
          lookupInNfcData(payloadText);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      // No es necesario cancelar la solicitud de tecnología aquí, ya que queremos seguir escuchando
    }
  };

  const lookupInNfcData = (key:any) => {
    const description = nfcData[key];
    if (description) {
      Alert.alert('Info del Monumento', description, [{ text: 'Ok', onPress: () => {} }]);
    } else {
      Alert.alert('Tag NFC Irreconocible', "Descripción no encontrada", [{ text: 'Ok', onPress: () => {} }]);
    }
  };

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
