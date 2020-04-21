import React, { Component } from "react";
import { View, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import *as firebase from "firebase";
import uuid from 'react-uuid'
import { TextInput } from "react-native-paper";
import Modal from 'react-native-modal';
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Text, Button, Block, Input, Card, Radio } from 'galio-framework'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Fire from '../Fire';

const items = [
  // this is the parent or 'item'
  {
    name: 'Categorie',
    id: 0,
    // these are the children or 'sub items'
    children: [
      {
        name: 'Apple',
        id: 10,
      },
      {
        name: 'Strawberry',
        id: 17,
      },
      {
        name: 'Pineapple',
        id: 13,
      },
      {
        name: 'Banana',
        id: 14,
      },
      {
        name: 'Watermelon',
        id: 15,
      },
      {
        name: 'Kiwi fruit',
        id: 16,
      },
    ],
  }

];

export default class PostScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
      video: {
        likes : 0,
        description : '',
        owner : Fire.uid,
        categories: [],
        uri: null
      },
      text: "",
      loading: false,
      selectedItems: [],
    }
  }

  onChangeText = (text) => {
    let v = this.state.video;
    v.description = text;
    this.setState({ video:v });
  }

  onSelectedItemsChange = (selectedItems) => {
    let v = this.state.video;
    v.categories = selectedItems;
    this.setState({ video:v, selectedItems });
  }

  componentDidMount() {
    this.getPermissionAsync();
    this._pickImage();
  }

  render() {

    return (
      <SafeAreaView style={{ backgroundColor: "#fff", height: "100%", display: "flex" }}>

        <View style={{
          padding: 20, flex: 1, flexDirection: "column", justifyContent: "space-evenly", alignItems: "center"
        }}>

          <View style={{
            shadowColor: "#471863",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.72,
            shadowRadius: 3.22,

            elevation: 3,
          }}>
            <TouchableOpacity onPress={this._pickImage} style={
              {
                width: Dimensions.get('screen').width / 2,
                height: Dimensions.get('screen').width / 2,
                backgroundColor: "#471863",
                borderRadius: Dimensions.get('screen').width,
                overflow: "hidden",
                alignContent: "center",
                justifyContent: "center"
              }
            }>
              <Video source={{ uri: this.state.video?.uri }} style={{
                height: Dimensions.get('screen').width / 2,
                width: Dimensions.get('screen').width / 2,
                zIndex: 3,
                position:"absolute",
                alignSelf:"center"
              }} />
              <Ionicons
                name='ios-add'
                size={64}
                color='#fafafa'
                style={{ zIndex: 2, position: "absolute", alignSelf: "center" ,lineHeight:Dimensions.get('screen').width / 2}}
              ></Ionicons>
            </TouchableOpacity>
          </View>

          <Input placeholder="Descrizione del video" right icon="text-fields" family="MaterialCommunityIcons" onChangeText={text => this.onChangeText(text)}/>

            <SectionedMultiSelect
              items={items}
              uniqueKey="name"
              subKey="children"
              selectText="Scegli una o più categorie"
              showDropDowns={true}
              modalWithSafeAreaView={true}
              readOnlyHeadings={true}
              onSelectedItemsChange={this.onSelectedItemsChange}
              selectedItems={this.state.selectedItems}
              confirmText="conferma"
              selectedText="selezionate"
              searchPlaceholderText="Cerca categoria"
              colors={{ primary: "#B23AFC" }}
              styles={{
                selectToggle: {
                  width: 320,
                },

                selectToggleText: {
                  color: '#471863',
                  zIndex: 10
                }
              }}

            />

          <Block center>
            <Button size="small" round uppercase style={{}} onPress={this._uploadVideo} loading={this.state.loading}>carica</Button>
          </Block>

        </View>

      </SafeAreaView>
    );
  }

  saveThumbnail = async (path) => {

    VideoThumbnails.getThumbnailAsync(path, { time: 1 }).then(response => {
      console.log({ response });
      return response.uri;
    })
      .catch(err => console.log({ err }));
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
      aspect: [9,16],
      quality: 0,
      videoExportPreset: 2
    });
    console.log(result);

    if (!result.cancelled) {
      let v = this.state.video;
      v.uri = result.uri;
      this.setState({ video: v });
    }

  };


  _uploadVideo = async () => {
    this.setState({ loading: true });
    var this_ = this;
    var newvideo = this.state.video;

    if(!newvideo && !newvideo.uri) return;
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const id = firebase.auth().currentUser.uid;
    
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () { resolve(xhr.response); };
      xhr.onerror = function (e) { reject(new TypeError('Network request failed')); };
      xhr.responseType = 'blob';
      xhr.open('GET', newvideo.uri, true);
      xhr.send(null);
    });

    const vid = uuid();
    const uploadTask = firebase.storage().ref().child(vid).put(blob);
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on('state_changed', function (snapshot) {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, function (error) {
      // Handle unsuccessful uploads
    }, function () {
      // We're done with the blob, close and release it
      blob.close();
      // Handle successful uploads on complete
      uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        console.log('File available at', downloadURL);
        newvideo.uri = downloadURL ;
        return downloadURL;
      })
        .then(path => { return VideoThumbnails.getThumbnailAsync(path, { time: 1 }) })
        .then(res => { return fetch(res.uri); }).then(r => { return r.blob(); })
        .then(file => { return firebase.storage().ref().child(`@thumb-${vid}`).put(file); })
        .then(snap => { return snap.ref.getDownloadURL(); })
        .then(url => {
          newvideo.thumbnail = url;
          newvideo.id = vid;
          return firebase.firestore().collection("videos").doc(vid).set(newvideo);
        })
        .then(() => {
          return firebase.firestore().collection("users").doc(id).get();
        })
        .then((user) => {
          let uv = user.data()?.user_videos || [];
          uv.push(newvideo);
          return firebase.firestore().collection("users").doc(id).set({ user_videos: uv });
        })
        .then(() => { this_.setState({ loading: false }); alert("Caricamento riuscito"); this_.props.navigation.goBack(); })
        .catch(err => { console.log(err) });
    });
  };

}


