import React from 'react';
import { View, Text } from 'react-native';
import MapView from 'react-native-maps';

const MapScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} />
    </View>
  );
};

export default MapScreen;
