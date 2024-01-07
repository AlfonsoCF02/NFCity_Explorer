import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Alert, Modal, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, LatLng, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import DocumentPicker from 'react-native-document-picker';
// @ts-ignore
import getDirections from 'react-native-google-maps-directions';
import RNFS from 'react-native-fs';
import { parseString } from 'xml2js';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MalagaKML, GranadaKML, BarcelonaKML } from '../data/RutasPredefinidas';
import polyline from '@mapbox/polyline';
import Config from 'react-native-config';


interface IMarker {
  title: string;
  coordinates: LatLng;
}

interface IPlacemark {
  name: string[];
  Point: [{ coordinates: string[] }];
}

const OptimizeRouteScreen: React.FC = () => {
  const [markers, setMarkers] = useState<IMarker[]>([]);
  const [mapName, setMapName] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modal2Visible, setModal2Visible] = useState<boolean>(false);
  const [startMarker, setStartMarker] = useState<IMarker | null>(null);
  const [endMarker, setEndMarker] = useState<IMarker | null>(null);
  const [currentRegion, setCurrentRegion] = useState<any>(undefined);
  const mapRef = useRef<MapView | null>(null);
  const [optimizeModalVisible, setOptimizeModalVisible] = useState<boolean>(false);
  const [selectedStartMarkerTitle, setSelectedStartMarkerTitle] = useState('');
  const [selectedEndMarkerTitle, setSelectedEndMarkerTitle] = useState('');
  const route = useRoute<RouteProp<{ params: { routeName: string } }, 'params'>>();
  const routeName = route.params?.routeName;
  const [routePolyline, setRoutePolyline] = useState([]);

  useEffect(() => {
    if (routeName) {
      let kmlData = '';
      if (routeName === 'Malaga') {
        kmlData = MalagaKML;
      } else if (routeName === 'Granada') {
        kmlData = GranadaKML;
      } else if (routeName === 'Barcelona'){
        kmlData = BarcelonaKML;
      }      
      // Aquí puedes agregar más condiciones para otras rutas predefinidas
      parsePredefinedKML(kmlData);
    } else {
      getOneTimeLocation();
    }
  }, [routeName]);


  const parsePredefinedKML = (kmlString: string) => {
    parseString(kmlString, (err: any, result) => {
      if (err) {
        console.error('Error parsing KML:', err);
        return;
      }
        const placemarks: IPlacemark[] = result.kml.Document[0].Placemark;
        const newMarkers: IMarker[] = placemarks.map((placemark: IPlacemark) => {
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
      //console.log(newMarkers); // Esto te mostrará la lista de marcadores en la consola
      if (newMarkers.length > 0 && mapRef.current) {
        const coordinates = newMarkers.map(marker => marker.coordinates);
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    });
  };

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

  const clearRoute = () => {
    setMarkers([]);         // Limpia los marcadores actuales
    setRoutePolyline([]);   // Limpia la polilínea actual
  };

  const drawRoute = (points) => {
    const route = polyline.decode(points);
    const routeCoords = route.map(point => {
      return { latitude: point[0], longitude: point[1] };
    });
    setRoutePolyline(routeCoords);
  };

  const selectAndParseKMLFile = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const res = results[0];
      
      if (res.type === 'application/vnd.google-earth.kml+xml') {
        setMapName(res.name?.split('.')[0] || '');
        if (res.uri) {
          const uri = Platform.OS === 'android' ? `file://${res.uri}` : res.uri;
          const kmlData = await RNFS.readFile(uri, 'utf8');
          parseString(kmlData, (err: any, result) => {
            if (err) {
              console.error('Error parsing KML:', err);
              return;
            }
              const placemarks: IPlacemark[] = result.kml.Document[0].Placemark;
              const newMarkers: IMarker[] = placemarks.map((placemark: IPlacemark) => {
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
            //console.log(newMarkers); // Esto te mostrará la lista de marcadores en la consola
            if (newMarkers.length > 0 && mapRef.current) {
              const coordinates = newMarkers.map(marker => marker.coordinates);
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }
          });
        }
      } else {
        Alert.alert('Error', 'Por favor, selecciona un archivo .kml válido.');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        const error = err as Error;
        console.error('Error al seleccionar el archivo:', error);
        Alert.alert('Error al seleccionar el archivo:', error.message);
      }
    }
  };

  const handleGetDirections = () => {

    //Para usarlo con MAPS maximo 9 ubicaciones
    if (markers.length > 9) {
      Alert.alert('Demasiados marcadores', 'Google Maps no puede optimizar rutas con más de 9 puntos. Usa nuestro software para poder optimizar hasta 23 puntos.');
      return;
    }

    if (!startMarker || !endMarker) {
      Alert.alert('Error', 'Por favor, selecciona un marcador de inicio y un marcador de fin.');
      return;
    }

    //console.log('Optimizando ruta entre:', startMarker.title, 'y', endMarker.title);
    // Cerrar el modal después de iniciar la optimización
    setOptimizeModalVisible(false);
    // Optimizar la ruta utilizando los marcadores seleccionados

    const data = {
      source: startMarker.coordinates,
      destination: endMarker.coordinates,
      params: [
        {
          key: 'travelmode',
          value: 'driving',
        },
      ],
      waypoints: markers.map(marker => marker.coordinates), // Incluir todos los marcadores como waypoints
    };

    getDirections(data);
  };

  const handleOptimizeButtonPress = () => {
    if (markers.length === 0) {
      Alert.alert('Carga una ruta', 'Para poder optimizar una ruta primero debes cargarla.');
    } else {
      setOptimizeModalVisible(true);
    }
  };

  // Cuando se selecciona un valor en el Picker, encuentra el marcador correspondiente y actualiza el estado
  const handleStartMarkerChange = (itemValue: string) => {
    const marker = markers.find(m => m.title === itemValue);
    setStartMarker(marker || null);
    setSelectedStartMarkerTitle(itemValue);
  };

  const handleEndMarkerChange = (itemValue: string) => {
    const marker = markers.find(m => m.title === itemValue);
    setEndMarker(marker || null);
    setSelectedEndMarkerTitle(itemValue);
  };

  const getAndDrawRoute = async () => {
    if (!startMarker || !endMarker) {
      Alert.alert('Error', 'Por favor, selecciona un marcador de inicio y un marcador de fin.');
      return;
    }

    const origin = `${startMarker.coordinates.latitude},${startMarker.coordinates.longitude}`;
    const destination = `${endMarker.coordinates.latitude},${endMarker.coordinates.longitude}`;
    const waypoints = markers.map(marker => `${marker.coordinates.latitude},${marker.coordinates.longitude}`).join('|');

    try {
      const apiKey = Config.GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=AIzaSyD-Q9-ylOL8ntFEjTsngWa_F5_l3tj_-Bw`
      );
      const json = await response.json();
      if (json.routes.length) {
        const points = polyline.decode(json.routes[0].overview_polyline.points);
        const coords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        setRoutePolyline(coords);
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
      Alert.alert('Error', 'No se pudo obtener la ruta');
    }
  };

  // Modificación en el evento del botón 'Optimizar Ruta'
  const handleOptimizeButtonnPress = async () => {

    //Para usarlo con MAPS maximo 9 ubicaciones
    if (markers.length > 23) {
      Alert.alert('Demasiados marcadores', 'Nuestro software no puede optimizar mas de 23 puntos.');
      return;
    }
    else {
      // Cierra el modal de selección de origen y destino
      setOptimizeModalVisible(false);
  
      // Asegúrate de que tienes marcadores de inicio y fin seleccionados
      if (!startMarker || !endMarker) {
        Alert.alert('Error', 'Por favor, selecciona un marcador de inicio y un marcador de fin.');
        return;
      }
  
      // Obtén y dibuja la ruta optimizada en el mapa
      await getAndDrawRoute();
  
      // Ajusta el mapa para mostrar la ruta completa
      if (routePolyline.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(routePolyline, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
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
      initialRegion={currentRegion}
      showsUserLocation={true}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinates}
          title={marker.title}
        />
      ))}
      {routePolyline.length > 0 && (
        <Polyline
          coordinates={routePolyline}
          strokeColor="#0000FF" // azul
          strokeWidth={3}
        />
      )}
    </MapView>
  
      <View style={styles.buttonContainer}>
        <Button title="Cargar Ruta" onPress={selectAndParseKMLFile} />
  
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.aboutUsButton}>
          <Text style={styles.aboutUsText}>Info</Text>
        </TouchableOpacity>
  
        {/* Modal de información */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModal2Visible(false)}
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
  
    {/* Modal para optimizar la ruta */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={optimizeModalVisible}
      onRequestClose={() => setOptimizeModalVisible(false)}
    >
      <View style={styles.centeredModalView}>
        <View style={styles.optimizeModalView}>
          <Text style={styles.modalText}>Selecciona el origen:</Text>
          
          <Picker
            selectedValue={startMarker ? startMarker.title : ''}
            onValueChange={(itemValue, itemIndex) =>
              setStartMarker(markers.find(marker => marker.title === itemValue) || null)
            }
            style={styles.picker}
          >
            <Picker.Item label="Despliegame" value="" />
            {markers.map((marker, index) => (
              <Picker.Item key={index} label={marker.title} value={marker.title} />
            ))}
          </Picker>

          <Text style={styles.modalText}>Selecciona el destino:</Text>

          <Picker
            selectedValue={endMarker ? endMarker.title : ''}
            onValueChange={(itemValue, itemIndex) =>
              setEndMarker(markers.find(marker => marker.title === itemValue) || null)
            }
            style={styles.picker}
          >
            <Picker.Item label="Despliegame" value="" />
            {markers.map((marker, index) => (
              <Picker.Item key={index} label={marker.title} value={marker.title} />
            ))}
          </Picker>

          {/* Botón de cierre con una X en la esquina */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setOptimizeModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <Button
            title="Optimizar con MAPS"
            onPress={handleGetDirections}
            color={markers.length > 9 ? "gray" : "#2196F3"}
          />
          <Button
          title="Optimizar Ruta"
          onPress={handleOptimizeButtonnPress}
          color={markers.length > 23 ? "gray" : "#2196F3"}
        />

            {/* Modal de información */}

            <TouchableOpacity onPress={() => setModal2Visible(true)} style={styles.aboutUsButton}>
              <Text style={styles.aboutUsText}>Info</Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modal2Visible}
              onRequestClose={() => setModal2Visible(false)}
            >
              <View style={styles.centeredModalView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalTitleText}>
                  En esta sección puedes elegir optimizar tu ruta de dos formas diferentes:
                  </Text>
                  {/* Lista de opciones */}
                  <View style={styles.optionList}>
                    <Text style={styles.optionItem}>
                      <Text style={styles.optionTitle}>• Con google MAPS: </Text>
                      Con google MAPS (permite hasta 9 puntos), y te guia por ellos
                    </Text>
                    <Text style={styles.optionItem}>
                      <Text style={styles.optionTitle}>• Con nuestro software: </Text>
                      Con nuestro software que permite hasta 23 puntos pero no te guía por ellos, te dibuja la líne que deberás seguir y tu puedes caminar entre los puntos, o pasarlos a Google Maps y que te guíe.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setModal2Visible(false)}
                  >
                    <Text style={styles.closeModalButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

        </View>
      </View>
    </Modal>
  
        <Button
          title="Optimizar Ruta"
          onPress={handleOptimizeButtonPress}
          color={markers.length === 0 ? "gray" : "#2196F3"}
        />

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
  optimizeModalView: {
    // Estilos específicos para el modal de optimización de ruta
    width: '70%', // Anchura como porcentaje del ancho de la pantalla
    height: '55%', // Altura como porcentaje de la altura de la pantalla
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'space-around', // Cambia a 'space-around' para una mejor distribución
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
  modalText: {
    marginBottom: 15,  // Aumenta el margen inferior para separar del selector
    textAlign: 'center',
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
  picker: {
    width: '100%', // El ancho se ajusta al ancho del modal
    height: 50, // Altura del Picker
    borderColor: 'grey', // Color del borde del Picker
    borderWidth: 1, // Ancho del borde del Picker
    marginBottom: 20, // Agrega margen inferior para separarlo del próximo texto o elemento
  },
  optimizeButton: {
    marginTop: 20, // Aumenta el margen superior para separar del último Picker
    width: '80%', // Ajusta el ancho del botón si es necesario
  },
  // ... (resto de tus estilos)
  modalTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  optionList: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  optionItem: {
    fontSize: 16,
    textAlign: 'justify',
  },
  optionTitle: {
    fontWeight: 'bold',
  },
});


export default OptimizeRouteScreen;
