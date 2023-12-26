import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import { RootStackParamList } from '../types/navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={ {headerShown: false}} />
      <Stack.Screen name="Map" component={MapScreen}  options={ {headerShown: false} } />
    </Stack.Navigator>
  );
}

export default Navigator;
