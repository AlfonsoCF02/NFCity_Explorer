// src/screens/LoginScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes'; // Asegúrate de que la ruta del import sea correcta


const LoginScreen = () => {
  const navigation = useNavigation<LoginScreen>(); // Uso del tipo definido para la prop de navegación

  GoogleSignin.configure({
    webClientId: '72759559374-q573n74lbmigf1j1g7blv1lfs22pfu1t.apps.googleusercontent.com',
  });


  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Ahora puedes navegar a la siguiente pantalla o hacer algo con userInfo
      navigation.navigate('MapScreen'); // Asegúrate de que 'MapScreen' esté definido en tu Navigator
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton onPress={signIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
