// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Modal, SafeAreaView, } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import Config from "react-native-config";
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../types/navigationTypes';
//import GDrive from 'react-native-google-drive-api-wrapper';


const LoginScreen: React.FC<{ navigation: LoginScreenNavigationProp }> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  GoogleSignin.configure({
    webClientId: Config.GOOGLE_MAPS_API_KEY,
  });

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = (await GoogleSignin.getTokens()).accessToken;
      // GDrive.setAccessToken(token);  
      // GDrive.init(); // Initialize the GDrive
      
      // Aquí se resetea la pila de navegación para que Home sea la nueva raíz
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], 
      });
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.modalText}>Logeate o Regístrate en nuestra App</Text>
      <GoogleSigninButton onPress={signIn} style={styles.googleButton} />
      
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.aboutUsButton}>
        <Text style={styles.aboutUsText}>About Us</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredModalView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>NFCity Explorer es una app que permite crear rutas con hasta 23 ubicaciones distintas así como buscar en camino optimo entre dichas ubicaciones y guiarte por ellas. Además, en dichas ubicaciones puedes leer un tag NFC y obtener información reelevante.</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6', // Este es un color de fondo genérico, ajusta según tu logo
  },
  logo: {
    width: 400, // Aumenta el tamaño del logo si es necesario
    height: 400,
    resizeMode: 'contain',
    marginBottom: 80, // Espacio entre el logo y los botones
  },
  googleButton: {
    width: 192,
    height: 48,
    marginBottom: 15, // Espacio entre los botones de Google
  },
  aboutUsButton: {
    marginTop: 80,
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

export default LoginScreen;
