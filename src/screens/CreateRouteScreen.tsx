import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';

type MarkerType = {
  latitude: number;
  longitude: number;
  name: string;
};

const CreateRouteScreen: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [markerName, setMarkerName] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [tempMarker, setTempMarker] = useState<MarkerType | null>(null);

  const handleMapPress = (e) => {
    setTempMarker({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
      name: '', // Nombre inicial vacío
    });
    setIsDialogVisible(true); // Muestra el modal para ingresar el nombre
  };

  const handleAddMarker = () => {
    if (tempMarker && markerName.trim()) {
      setMarkers([...markers, { ...tempMarker, name: markerName }]);
      setMarkerName(''); // Limpia el nombre para el siguiente marcador
      setIsDialogVisible(false); // Oculta el modal
      setTempMarker(null); // Limpia el marcador temporal
    } else {
      Alert.alert('Error', 'Por favor, ingrese un nombre para el marcador.');
    }
  };

  const convertMarkersToKML = (markers: MarkerType[]) => {
    let kmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>`;
    markers.forEach((marker, index) => {
      kmlString += `
      <Placemark>
        <name>${marker.name || `Marker ${index + 1}`}</name>
        <Point>
          <coordinates>${marker.longitude},${marker.latitude}</coordinates>
        </Point>
      </Placemark>`;
    });
    kmlString += `</Document></kml>`;
    return kmlString;
  };


const saveRoute = async () => {
  try {
    const kmlData = convertMarkersToKML(markers);
    const path = `${RNFS.DownloadDirectoryPath}/ruta.kml`;
    await RNFS.writeFile(path, kmlData, 'utf8');
    Alert.alert('Ruta Guardada', `La ruta ha sido guardada con éxito en: ${path}`);
  } catch (error) {
    Alert.alert('Error al guardar la ruta', error.message);
  }
};

  const shareRoute = async () => {
    const kmlData = convertMarkersToKML(markers);
    const filePath = `${RNFS.TemporaryDirectoryPath}/ruta.kml`;
    try {
      await RNFS.writeFile(filePath, kmlData, 'utf8');
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.google-earth.kml+xml',
        title: 'Compartir Ruta KML',
      });
    } catch (error) {
      console.error('Error compartiendo la ruta:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
          />
        ))}
      </MapView>
      <Button title="Guardar Ruta" onPress={saveRoute} />
      <Button title="Compartir Ruta" onPress={shareRoute} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDialogVisible}
        onRequestClose={() => setIsDialogVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              placeholder="Nombre del marcador"
              value={markerName}
              onChangeText={setMarkerName}
              style={styles.textInput}
            />
            <Button title="Agregar Marcador" onPress={handleAddMarker} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD8E6',
  },
  map: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    padding: 10,
    marginBottom: 20,
  },
});

export default CreateRouteScreen;

