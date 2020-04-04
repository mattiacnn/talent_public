import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import *as firebase from "firebase";
import uuid from 'react-uuid'

export default class PostScreen extends React.Component {

    state = {
        video: null,
      };

    componentDidMount(){
        this.getPermissionAsync();
    }

    render() {

        let bottone = null;

        if (this.state.video) {
            bottone = (
                <Button
                    title="Carica"
                    onPress={this.uploadImageAsync}
                />
            );
        }

        return (
            <View style={styles.container}>
                <Text>Ciao</Text>
                <Button
                    title="Pick a video from camera roll"
                    onPress={this._pickImage}
                />
                <Video
                    source={{ uri: this.state.video }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                    style={{ width: 300, height: 300 }}
                />

                {bottone}
                
            </View>
        );
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
        }
      }
    
      _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1
        });
    
        console.log(result);
    
        if (!result.cancelled) {
          this.setState({ video: result.uri });
        }
      };
        

      uploadImageAsync = async () => {
        // Why are we using XMLHttpRequest? See:
        // https://github.com/expo/expo/issues/2402#issuecomment-443726662
        let uri = this.state.video;
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            resolve(xhr.response);
          };
          xhr.onerror = function(e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
      
        const ref = firebase
          .storage()
          .ref()
          .child(uuid());
        const snapshot = await ref.put(blob);
      
        // We're done with the blob, close and release it
        blob.close();
      
        return await snapshot.ref.getDownloadURL();
      }
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});


