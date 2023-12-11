import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const HomeScreen = ({ navigation }) => {
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null); // Especifica el tipo de Region

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
        Alert.alert('Permission error', err.toString()); // Convierte err a string
      }
    } else {
      getOneTimeLocation();
    }
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentRegion({
            latitude: currentRegion?.latitude || 0,
            longitude: currentRegion?.longitude || 0,
            latitudeDelta: 1, // Aumenta este valor
            longitudeDelta: 1, // Aumenta este valor
        });
      },
      (error) => {
        Alert.alert('Location error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Crear Ruta" onPress={() => console.log('Crear Ruta')} />
        <Button title="Cargar Ruta" onPress={() => console.log('Cargar Ruta')} />
      </View>
      {currentRegion && (
        <MapView
          style={styles.map}
          initialRegion={currentRegion} // Usa initialRegion en lugar de region
          showsUserLocation
        >
          <Marker coordinate={currentRegion} />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
});

export default HomeScreen;
