// CreateRouteScreen.tsx

import React from 'react';
import { View, Text } from 'react-native';
import MapView from 'react-native-maps';


const OptimiceRouteScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} />
    </View>
  );
};

//Importa un mapa del telefono o drive y optimiza la ruta de los puntos de ese mapa

//Importante exportarlo bien
export default OptimiceRouteScreen;