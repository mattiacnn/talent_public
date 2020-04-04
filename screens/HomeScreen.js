import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

export default class HomeScreen extends React.Component {

    render() {
      return (
          <View style={styles.container}>
              <Text>Home Screen</Text>
          </View>
      );
    }
    
    componentDidMount() {
        this.checkIfLoggedIn();
        // this.getPermissionAsync();
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});
