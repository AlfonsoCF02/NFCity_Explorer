import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
// No necesitas importar RootStackParamList si no estás utilizando TypeScript o no tienes tipos específicos definidos para tu stack de navegación.

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default Navigator;
