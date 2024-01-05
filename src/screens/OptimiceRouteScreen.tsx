import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, Platform } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import { parseString } from 'xml2js';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';

const OptimiceRouteScreen = () => {
  const [fileUri, setFileUri] = useState<string>('');

  const selectKMLFile = async () => {
    try {
      // DocumentPickerResponse[] is an array
      const results = await DocumentPicker.pick({
        type: [types.allFiles],
      });

      // Get the first file from the array
      const res = results[0];

      console.log('File picked:', res);

      if (res && res.uri) {
        if (Platform.OS === 'android') {
          const newFilePath = `${RNFS.DocumentDirectoryPath}/${res.name}`;
          await RNFS.copyFile(res.uri, newFilePath);
          setFileUri(newFilePath);
        } else {
          setFileUri(res.uri);
        }
      } else {
        Alert.alert('Error', 'URI not found in the response');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the file picker');
      } else {
        console.error('Error picking file:', err);
        Alert.alert('Error picking file:', err.message);
      }
    }
  };

  const parseKML = async () => {
    if (!fileUri) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    try {
      const kmlData = await RNFS.readFile(fileUri, 'utf8');
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

        console.log('Parsed data:', parsedData);
      });
    } catch (err) {
      console.error('Error reading file:', err);
      Alert.alert('Error reading file:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select KML File" onPress={selectKMLFile} />
      <Button title="Parse KML" onPress={parseKML} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimiceRouteScreen;
