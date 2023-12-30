// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../types/navigationTypes';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);

  // Asegúrate de configurar el GoogleSignin con tu webClientId
  GoogleSignin.configure({
    webClientId: '997526284403-5g38gvc8u4h82g5i9uv5i165r59jlh5l.apps.googleusercontent.com',
  });

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} // Asegúrate de que la ruta al logo es correcta
        style={styles.logo}
      />
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
    width: 150,
    height: 150,
    marginBottom: 32,
  },
  googleButton: {
    width: 192,
    height: 48,
    marginBottom: 20,
  },
  aboutUsButton: {
    marginTop: 20,
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
