import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert, Modal, TextInput, Text, Platform, PermissionsAndroid, 
  TouchableOpacity, Image, SafeAreaView, BackHandler } from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import { GeoLocationError } from '../types/errorTypes';
import { CreateRouteScreenNavigationProp, MarkerType, MapPressEvent } from '../types/navigationTypes';


const CreateRouteScreen: React.FC<{ navigation: CreateRouteScreenNavigationProp }> = ({ navigation }) => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [markerName, setMarkerName] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [tempMarker, setTempMarker] = useState<MarkerType | null>(null);
  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapName, setMapName] = useState('');
  const [routeSaved, setRouteSaved] = useState(false);


  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  useEffect(() => {
    const backAction = () => {
      if (markers.length > 0 && !routeSaved) {
        Alert.alert('Guardar Ruta', 'Tienes una ruta sin guardar. ¿Deseas salir sin guardar?', [
          {
            text: 'Cancelar',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'Salir', onPress: () => navigation.goBack() },
        ]);
        return true;
      }
  
      // Si no hay marcadores o la ruta ya fue guardada
      return false;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [markers, routeSaved, navigation]);
  

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getOneTimeLocation();
        } else {
          Alert.alert('Location permission denied');
        }
      } catch (err) {
        if (err instanceof Error) {
          Alert.alert('Permission error', err.message);
        }
      }
    } else {
      getOneTimeLocation();
    }
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error: GeoLocationError) => {
        Alert.alert('Location error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleMapPress = (e: MapPressEvent) => {
    if (markers.length >= 23) {
      Alert.alert('Límite alcanzado', 'No puedes agregar más de 23 marcadores.');
      return;
    }
  
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
      setRouteSaved(false);
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
    if (!mapName.trim()) {
      Alert.alert('Error', 'Por favor, introduzca un nombre para el mapa.');
      return;
    }
    try {
      const kmlData = convertMarkersToKML(markers);
      const fileName = `${mapName.replace(/\s+/g, '_')}.kml`;
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, kmlData, 'utf8');
      setRouteSaved(true);
      Alert.alert('Ruta Guardada', `La ruta ha sido guardada con éxito en: ${path}`);
    } catch (error) {
      const err = error as Error;
      Alert.alert('Permission error', err.message);
      setRouteSaved(false);
    }    
  };

  const shareRoute = async () => {
    if (!mapName.trim()) {
      Alert.alert('Error', 'Por favor, introduzca un nombre para el mapa.');
      return;
    }
    try {
      const kmlData = convertMarkersToKML(markers);
      const fileName = `${mapName.replace(/\s+/g, '_')}.kml`;
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, kmlData, 'utf8');
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.google-earth.kml+xml',
        title: 'Compartir Ruta KML',
      });
      setRouteSaved(true);
    } catch (error) {
      //console.error('Error compartiendo la ruta:', error);
      //Alert.alert('No compartido', 'El usuario ha cancelado el proceso de compartición.');
      //Mejor el segundo. Si no se pone nada, simplemente se sigue adelante
      setRouteSaved(false);
    }
  };
  
  const handleMarkerPress = (markerIndex: number) => {
    // Actualiza el estado para excluir el marcador en el que se hizo clic
    setMarkers(currentMarkers => currentMarkers.filter((_, index) => index !== markerIndex));
  };

  return (
    <View style={styles.container}>

      <TextInput
              placeholder="Nombre del mapa"
              value={mapName}
              onChangeText={setMapName}
              style={styles.mapNameInput}
            />

      <MapView
        style={styles.map}
        initialRegion={currentRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            onPress={() => handleMarkerPress(index)} // Añade el gestor de eventos aquí
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Guardar Ruta" onPress={saveRoute} />
        

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
          <View style={styles.modal2View}>
            <Text style={styles.modalText}>En esta sección se pueden crear (guardar y compartir) mapas de ruta en formato .kml. Para ello, primero dale un nombre al mapa (no podrás guardar hasta que lo hagas); posteriormente toca en el punto donde quieras poner un marcador (puedes poner hasta 23!) y especifica su nombre. Una vez terminado puedes guardar o compartir tu mapa!. Una vez tengas el mapa, puedes optimizar la ruta, con nuestro optimizador.</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        
        <Button title="Compartir Ruta" onPress={shareRoute} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDialogVisible}
        onRequestClose={() => setIsDialogVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Botón de cierre con una X en la esquina */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDialogVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10, // espacio vertical alrededor de los botones
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
    position: 'relative', // Importante para posicionar absolutamente el botón de cierre
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    padding: 10,
    marginBottom: 20,
  },
  mapNameInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  // Estilos boton de info

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
  modal2View: {
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
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
  modalTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  // Fin estilos boton info

});

export default CreateRouteScreen;

