// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const HomeScreen = ({ navigation }) => {
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      requestLocationPermission();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
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
      console.warn(err);
    }
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      },
      (error) => {
        console.warn(error.message);
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
          region={currentRegion}
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
