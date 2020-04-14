import React from "react";
import { View, Text, StyleSheet, Button, StatusBar } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Fire from "../Fire";

export default class HomeScreen extends React.Component {

    render() {
      return (
          
          <View style={styles.container}>
              <StatusBar backgroundColor="blue" barStyle="dark-content" ></StatusBar>
              <Text>Timeline</Text>
              <Button
                            onPress={() => {
                                Fire.shared.signOut();
                            }}
                            title="Log out"
                        />
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
        justifyContent: "center",
        backgroundColor: '#ECF0F1',
    }
});
