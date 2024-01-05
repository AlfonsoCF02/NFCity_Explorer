import React from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView from 'react-native-maps';
import DocumentPicker from 'react-native-document-picker';
import { parseString } from 'react-native-xml2js';
import RNFS from 'react-native-fs'; // Importa la librería de acceso a sistema de archivos

const OptimiceRouteScreen: React.FC = () => {


  const kmlData = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
          <Placemark>
              <name>Punto 1</name>
              <Point>
                  <coordinates>-4.798650965094566,37.89072441711053</coordinates>
              </Point>
          </Placemark>
          <Placemark>
              <name>Punto 2</name>
              <Point>
                  <coordinates>-4.773256480693817,37.88457181120253</coordinates>
              </Point>
          </Placemark>
      </Document>
  </kml>`;
  
  const parseKML = () => {
    parseString(kmlData, (err, result) => {
      if (err) {
        console.error('Error parsing KML:', err);
        return;
      }
  
      const placemarks = result.kml.Document[0].Placemark;
      const parsedData = placemarks.map(placemark => {
        const name = placemark.name[0];
        const coordinates = placemark.Point[0].coordinates[0].split(',');
        return {
          name,
          latitude: parseFloat(coordinates[1]),
          longitude: parseFloat(coordinates[0])
        };
      });
  
      console.log(parsedData);
    });
  };
  

  return (
    <View style={styles.container}>
      <Button title="Parse KML" onPress={parseKML} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default OptimiceRouteScreen;
