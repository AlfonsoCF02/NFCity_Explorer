import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { parseString } from 'xml2js';

const parseKML = (kmlContent) => {
  return new Promise((resolve, reject) => {
    parseString(kmlContent, (err, result) => {
      if (err) {
        reject(err);
      } else {
        try {
          const placemarks = result.kml.Document[0].Placemark;
          const coordinates = placemarks.map(placemark => {
            const name = placemark.name[0];
            const coords = placemark.Point[0].coordinates[0].trim().split(',');
            return {
              latitude: parseFloat(coords[1]),
              longitude: parseFloat(coords[0]),
              title: name,
            };
          });
          resolve(coordinates);
        } catch (error) {
          reject('Error parsing KML file');
        }
      }
    });
  });
};

const OptimiceRouteScreen: React.FC = () => {
  const [coordinates, setCoordinates] = useState([]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to read files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS no requiere permisos explícitos para el acceso al almacenamiento
  };

  const selectFile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to read files.');
      return;
    }

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const fileContent = await RNFS.readFile(res.uri);
      const parsedCoordinates = await parseKML(fileContent);
      setCoordinates(parsedCoordinates);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('File selection cancelled');
      } else {
        Alert.alert('Error', 'An error occurred while selecting the file.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {coordinates.map((coord, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
            title={coord.title}
          />
        ))}
      </MapView>
      <Button title="Select KML File" onPress={selectFile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default OptimiceRouteScreen;

