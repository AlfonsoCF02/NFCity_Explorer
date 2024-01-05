import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Alert, Modal, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import DocumentPicker, { types } from 'react-native-document-picker';
import { parseString } from 'xml2js';
import RNFS from 'react-native-fs';

interface IMarker {
  title: string;
  coordinates: LatLng;
}

const OptimizeRouteScreen: React.FC = () => {
  const [markers, setMarkers] = useState<IMarker[]>([]);
  const [mapName, setMapName] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<MapView.Region | undefined>(undefined);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    getOneTimeLocation();
  }, []);

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => Alert.alert('Error', 'No se pudo obtener la ubicación'),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  };

  const selectAndParseKMLFile = async () => {
    try {
      const results = await DocumentPicker.pick({ type: [types.allFiles] });
      const res = results[0];
      setMapName(res.name?.split('.')[0] || '');
      if (res.uri) {
        const uri = Platform.OS === 'android' ? `file://${res.uri}` : res.uri;
        const kmlData = await RNFS.readFile(uri, 'utf8');
        parseString(kmlData, (err: any, result) => {
          if (err) {
            console.error('Error parsing KML:', err);
            return;
          }
          const placemarks = result.kml.Document[0].Placemark;
          const newMarkers: IMarker[] = placemarks.map(placemark => {
            const name = placemark.name[0];
            const coordinates = placemark.Point[0].coordinates[0].split(',');
            return {
              title: name,
              coordinates: {
                latitude: parseFloat(coordinates[1]),
                longitude: parseFloat(coordinates[0]),
              },
            };
          });
          setMarkers(newMarkers);
          if (newMarkers.length > 0 && mapRef.current) {
            const coordinates = newMarkers.map(marker => marker.coordinates);
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        });
      } else {
        Alert.alert('Error', 'URI no encontrada en la respuesta');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error al seleccionar el archivo:', err);
        Alert.alert('Error al seleccionar el archivo:', err.message);
      }
    }
  };
  const optimizeRoute = () => {
    console.log('Optimizar Ruta');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre de la ruta"
        value={mapName}
        editable={false}
        style={styles.mapNameInput}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinates}
            title={marker.title}
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Cargar Ruta" onPress={selectAndParseKMLFile} />

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.aboutUsButton}>
        <Text style={styles.aboutUsText}>Info</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredModalView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Aquí puedes seleccionar un archivo KML para cargar los marcadores en el mapa.
              Luego, puedes utilizar la funcionalidad de optimización de ruta.
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Button title="Optimizar Ruta" onPress={optimizeRoute} />
      </View>

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
  mapNameInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  aboutUsButton: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutUsText: {
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
  centeredModalView: {
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
  closeModalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OptimizeRouteScreen;
