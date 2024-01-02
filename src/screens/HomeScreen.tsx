import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Platform, PermissionsAndroid, Alert } from 'react-native';
import { Image, TouchableOpacity, Modal, SafeAreaView, } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { HomeScreenNavigationProp } from '../types/navigationTypes';
import { GeoLocationError } from '../types/errorTypes';


const HomeScreen: React.FC<{ navigation: HomeScreenNavigationProp }> = ({ navigation }) => {
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [userName, setUserName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    getCurrentUserName();
  }, []);


  const getCurrentUserName = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      // Asegúrate de que userName sea una cadena. Si userInfo.user.name es null, usa una cadena vacía o un valor predeterminado.
      setUserName(userInfo.user.name || '');
    } catch (error) {
      console.error('Error getting user info:', error);
      setUserName(''); // Establece un valor predeterminado o vacío si hay un error.
    }
  };
  

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
  
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenido {userName}.</Text>

      <View style={styles.buttonContainer}>
        <Button title="Crear Ruta" onPress={() => navigation.navigate('CreateRoute')} />
        <Button title="Cargar Ruta" onPress={() => console.log('Cargar Ruta')} />
        <Button title="Log Out" onPress={signOut} />
      </View>

      <View style={styles.mapContainer}>
      <Text style={styles.welcomeText}>Tu ubicación actual es:</Text>
        {currentRegion && (
          <MapView
            style={styles.map}
            initialRegion={currentRegion}
            showsUserLocation
          >
            <Marker coordinate={currentRegion as Region} />
          </MapView>
        )}
      </View>

      <View style={styles.predefinedRoutesContainer}>
      <Text style={styles.welcomeText}>En base a tu ubicación te recomendamos las siguentes rutas predefinidas:</Text>
        <Button title="Granada" onPress={() => console.log('Ruta Granada')} />
        <Button title="Málaga" onPress={() => console.log('Ruta Málaga')} />
        <Button title="Barcelona" onPress={() => console.log('Ruta Barcelona')} />
      </View>

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
            <Text style={styles.modalText}>NFCity Explorer is an app that allows you to...</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  mapContainer: {
    flex: 2, // Ajusta este valor según tus necesidades para cambiar el tamaño del mapa
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  predefinedRoutesContainer: {
    flex: 1,
    justifyContent: 'space-around',
    padding: 10,
    textAlign: 'center',
  },
  aboutUsButton: {
    marginTop: -5,
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
});

export default HomeScreen;
