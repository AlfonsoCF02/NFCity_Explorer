import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';


type MarkerType = {
  latitude: number;
  longitude: number;
};

const CreateRouteScreen: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  

  const handleMapPress = (e) => {
    const newMarker: MarkerType = {
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    };
    setMarkers(currentMarkers => [...currentMarkers, newMarker]);
  };

  const handleMarkerPress = (index: number) => {
    const newMarkers = markers.filter((_, markerIndex) => markerIndex !== index);
    setMarkers(newMarkers);
  };

  

  const saveDataToFile = async (data: string) => {
    try {
      // Lanzar selector de documentos para que el usuario elija dónde guardar el archivo
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
  
      // Accede al primer archivo seleccionado si existe
      const uri = res[0]?.uri;
  
      if (uri) {
        await RNFS.writeFile(uri, data, 'utf8');
        Alert.alert('Archivo Guardado', `Datos guardados en: ${uri}`);
      } else {
        Alert.alert('Error', 'No se seleccionó ningún archivo.');
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error al guardar archivo', error.message);
      }
    }
  };

  const saveRoute = async () => {
    try {
      const jsonValue = JSON.stringify(markers);
      await AsyncStorage.setItem('@route_markers', jsonValue);
      await saveDataToFile(jsonValue);
      Alert.alert('Ruta Guardada', 'Tu ruta ha sido guardada con éxito.');
    } catch (e) {
      Alert.alert('Error', 'La ruta no pudo ser guardada.');
    }
  };

  const shareRoute = async () => {
    const jsonValue = JSON.stringify(markers);
    const shareOptions = {
      title: 'Guardar Ruta',
      message: jsonValue,
      type: 'application/json',
      filename: 'ruta.json', // nombre de archivo sugerido
    };
  
    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error compartiendo la ruta:', error);
    }
  };
  
  // En tu JSX
  <Button title="Compartir Ruta" onPress={shareRoute} />

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            onPress={() => handleMarkerPress(index)} // Agregar evento onPress al marcador
          />
        ))}
      </MapView>
      <Button title="Guardar Ruta" onPress={saveRoute} />
      <Button title="Compartir Ruta" onPress={shareRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD8E6', // Aplicando color de fondo azul clarito a todo el contenedor
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10, // Añade un margen en la parte inferior
  },
  map: {
    flex: 1,
  },
});

export default CreateRouteScreen;

