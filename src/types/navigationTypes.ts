// src/types/navigationTypes.ts
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { LatLng } from 'react-native-maps';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Map: undefined;
  CreateRoute: undefined;
  OptimiceRoute: undefined;
  // ... otros nombres de rutas y parámetros ...
};

// Definir los tipos de navegación específicos para cada pantalla
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type CreateRouteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateRoute'>; // Añade esto para la navegación de CreateRoute
export type OptimiceRouteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OptimiceRoute'>;
// ... otros tipos de navegación si es necesario ...


export type MarkerType = {
  latitude: number;
  longitude: number;
  name: string;
};

export type MapPressEvent = {
  nativeEvent: {
    coordinate: LatLng;
  };
};