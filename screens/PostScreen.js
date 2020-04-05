import React from "react";
import { View, Image,Text, StyleSheet, Button, SafeAreaView,TouchableOpacity } from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import *as firebase from "firebase";
import uuid from 'react-uuid'
import { TextInput } from "react-native-paper";
import Modal from 'react-native-modal';
import { Ionicons } from "@expo/vector-icons";

export default class PostScreen extends React.Component {
    state = {
        video: null,
        text: null,
      };

    componentDidMount(){
        this.getPermissionAsync();
        this._pickImage();
    }

    render() {

        let bottone = null;

        if (this.state.video) {
            bottone = (
              <TouchableOpacity style={styles.button} onPress={this.uploadImageAsync} >
              <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                   <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:15,marginTop:-3 }}>CARICA</Text>
                 </View>
          </TouchableOpacity>
            );
        }

        return (
               /* <Video
                    source={{ uri: this.state.video }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                    style={{ width: 300, height: 300 }}
                />
                {bottone}         */
                <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Ionicons name="md-arrow-back" size={24} color="#D8D9DB"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.handlePost}>
                        <Text style={{ fontWeight: "500" }}>Post</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                   <View style={{flexDirection:"row", }}>
                    <Image source={require("../assets/tempAvatar.jpg")} style={styles.avatar}></Image>
                    <Text>Mattia Cannavò</Text>
                   </View>
                </View>

                      <TextInput
                        multiline={true}
                        numberOfLines={4}
                        style={styles.textBox}
                        placeholder="Want to share something?"
                        onChangeText={text => this.setState({ text })}
                        value={this.state.text}
                      >

                    </TextInput>
                <TouchableOpacity style={styles.photo} onPress={this.pickImage}>
                    <Ionicons name="md-camera" size={32} color="#D8D9DB"></Ionicons>
                </TouchableOpacity>

                <View style={{ marginHorizontal: 32, marginTop: 32, height:"100%" }}>
                <Video
                    source={{ uri: this.state.video }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                    style={{ width: "100%", height: "30%" }}
                />
                {bottone}
                </View>
            </SafeAreaView>
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
        if (!this.state.video)
        {
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
        backgroundColor:"white",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9DB"
    },
    button: {
      backgroundColor: "#FF5166",
      padding: 18,
      width:"70%",        
      borderRadius:30,
      alignSelf:"center",
      marginTop:20

  },
    inputContainer: {
      margin:20,
      flexDirection: "column",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    photo: {
        alignItems: "flex-end",
        marginHorizontal: 32
    },
    textBox:{
      height:"20%",
      backgroundColor:"white",
      borderWidth:1,
      borderColor:"#E7E7E7",
      width:"95%",
      alignSelf:"center"
    }
});


