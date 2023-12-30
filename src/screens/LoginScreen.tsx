// src/screens/LoginScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../types/navigationTypes'; // Asegúrate de importar el tipo correcto

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  GoogleSignin.configure({
    webClientId: '997526284403-5g38gvc8u4h82g5i9uv5i165r59jlh5l.apps.googleusercontent.com',
  });

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      navigation.navigate('Home'); // Navegar a HomeScreen después del inicio de sesión
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
