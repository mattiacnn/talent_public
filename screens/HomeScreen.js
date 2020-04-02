import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export default class HomeScreen extends React.Component {
    state = {
        image: null,
      };

    signOut = () => {
        firebase.auth().signOut();
    };

    componentDidMount() {
        this.checkIfLoggedIn();
        this.getPermissionAsync();
       }

    checkIfLoggedIn = () =>{
        firebase.auth().onAuthStateChanged(function(user){
            if(!user)
            {
                this.props.navigation.navigate('Login');
            }
        }.bind(this)
        );
    };
 
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
          this.setState({ image: result.uri });
        }
      };
        
    render() {
        return (
            <View style={styles.container}>
                <Button title="sign out" onPress={this.signOut}></Button>
                <Text>Ciao mbare!</Text>
                <Button
                    title="Pick an image from camera roll"
                    onPress={this._pickImage}
                />
                <Video
                source={{ uri: this.state.image }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay
                isLooping
                style={{ width: 300, height: 300 }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});
