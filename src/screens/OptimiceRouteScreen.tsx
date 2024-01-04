import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { parseString } from 'react-native-xml2js';

const parseKML = async (kmlContent) => {
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

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      console.log('Archivo seleccionado:', res);

      // Leer el contenido del archivo
      const fileContent = await RNFS.readFile(res.uri);
      const parsedCoordinates = parseKML(fileContent);
      setCoordinates(parsedCoordinates);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Selección cancelada');
      } else {
        Alert.alert('Error', 'Ocurrió un error al seleccionar el archivo.');
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
            title={`Marcador ${index + 1}`}
          />
        ))}
      </MapView>
      <Button title="Seleccionar archivo KML" onPress={selectFile} />
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
