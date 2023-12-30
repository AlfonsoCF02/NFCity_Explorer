// src/types/navigationTypes.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Map: undefined;
  CreateRoute: undefined;
  // ... otros nombres de rutas y parámetros ...
};

// Definir los tipos de navegación específicos para cada pantalla
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type CreateRouteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateRoute'>; // Añade esto para la navegación de CreateRoute
// ... otros tipos de navegación si es necesario ...
