import React from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView from 'react-native-maps';
import DocumentPicker from 'react-native-document-picker';

const OptimiceRouteScreen: React.FC = () => {

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      console.log('Archivo seleccionado:', res);
      // Aquí puedes agregar lógica para leer y procesar el archivo

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Selección cancelada');
      } else {
        Alert.alert('Error', 'Ocurrió un error al seleccionar el archivo.');
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} />
      <Button title="Seleccionar archivo" onPress={selectFile} />
    </View>
  );
};

export default OptimiceRouteScreen;
