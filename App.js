import React, {useEffect, useState} from 'react';
import {Button, PermissionsAndroid, StyleSheet, Text, View} from 'react-native';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const [result, setResult] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [sharingInStory, setSharingInStory] = useState(false);

  const requestExternalStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.warn(err);
    }
  };

  function getErrorString(error, defaultValue) {
    let e = defaultValue || 'Something went wrong. Please try again';
    if (typeof error === 'string') {
      e = error;
    } else if (error && error.message) {
      e = error.message;
    } else if (error && error.props) {
      e = error.props;
    }
    return e;
  }

  const fetchImageAndConvertToBase64 = imageUrl => {
    return new Promise(resolve => {
      let imagePath = null;

      RNFetchBlob.config({
        fileCache: true,
      })
        .fetch('GET', imageUrl)
        .then(resp => {
          imagePath = resp.path();
          return resp.readFile('base64');
        })
        .then(async base64Data => {
          resolve({base64Data, imagePath});
        });
    });
  };

  const shareToInstagramStory = async () => {
    setSharingInStory(true);

    const fs = RNFetchBlob.fs;
    const imageURL =
      'http://blog.mercadodiferente.com.br/wp-content/uploads/2022/08/diferente-38-1-scaled.jpg';

    fetchImageAndConvertToBase64(imageURL).then(async base64Data => {
      try {
        const shareOptions = {
          social: Share.Social.INSTAGRAM_STORIES,
          stickerImage: 'data:image/png;base64,' + base64Data.base64Data,
          backgroundTopColor: '#f5f3ef',
          backgroundBottomColor: '#fe4f20',
          attributionURL:
            'https://staging.mercadodiferente.com.br/blog/praticas-para-o-aproveitamento-total-dos-alimentos',
        };

        const ShareResponse = await Share.shareSingle(shareOptions);
        setResult(JSON.stringify(ShareResponse, null, 2));
      } catch (error) {
        console.log('Error =>', error);
        setResult('error: '.concat(getErrorString(error)));
      }

      fs.unlink(base64Data.imagePath);

      setSharingInStory(false);
    });
  };

  useEffect(() => {
    requestExternalStoragePermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.mb10}>Resultado: {result || '-'}</Text>
      <View>
        <Button
          title={
            sharingInStory
              ? 'Baixando imagens...'
              : 'Compartilhar no story do Instagram'
          }
          onPress={shareToInstagramStory}
          disabled={sharingInStory || !hasPermission}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    margin: 10,
    justifyContent: 'center',
  },
  mb10: {
    marginBottom: 10,
  },
});

export default App;
