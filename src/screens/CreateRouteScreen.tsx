// CreateRouteScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

//No furula

//Muestra un mapa y se ponen puntos, luego se guarda en el telefono o drive (boton)
// posteriormente se puede optimizar (boton) -> lo que hace es guardarlo igual que si le damos a guardar
// y redirige lo manda a optimice route screen que se puede importar aqui

type MarkerType = {
  latitude: number;
  longitude: number;
};

const CreateRouteScreen: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  const handleMapPress = (e: GestureResponderEvent) => {
    const coordinate = e.nativeEvent as any;  // Usando 'as any' para acceder a las coordenadas
    const newMarker: MarkerType = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    setMarkers([...markers, newMarker]);
  };


  const saveRoute = async () => {
    try {
      const jsonValue = JSON.stringify(markers);
      await AsyncStorage.setItem('@route_markers', jsonValue);
      Alert.alert('Ruta Guardada', 'Tu ruta ha sido guardada con éxito.');
    } catch (e) {
      Alert.alert('Error', 'La ruta no pudo ser guardada.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
      </MapView>
      <Button title="Guardar Ruta" onPress={saveRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default CreateRouteScreen;
