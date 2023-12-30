import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CreateRouteScreen from '../screens/CreateRouteScreen';
import OptimiceRouteScreen from '../screens/OptimiceRouteScreen';
// No necesitas importar RootStackParamList si no estás utilizando TypeScript o no tienes tipos específicos definidos para tu stack de navegación.

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateRoute" component={CreateRouteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OptimiceRoute" component={OptimiceRouteScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default Navigator;
