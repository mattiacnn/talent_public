import React, { Component } from "react";
import { View, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import *as firebase from "firebase";
import uuid from 'react-uuid'
import { TextInput } from "react-native-paper";
import Modal from 'react-native-modal';
import { Ionicons, SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Text, Button, Block, Input, Card, Radio, Slider } from 'galio-framework'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Fire from '../Fire';
import { withGlobalContext } from "../GlobalContext";
import TagInput from 'react-native-tags-input';

const items = [
  // this is the parent or 'item'
  {
    name: 'Categorie',
    id: 0,
    // these are the children or 'sub items'
    children: [
      {
        name: 'Comicità',
        id: 10,
      },
      {
        name: 'Canto',
        id: 17,
      },
      {
        name: 'Ballo',
        id: 13,
      },
      {
        name: 'Sport',
        id: 14,
      },
      {
        name: 'Recitazione',
        id: 15,
      },
      {
        name: 'Tik Tok',
        id: 16,
      },
    ],
  }

];

class PostScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
      tags: {
        tag: '',
        tagsArray: []
      },
      video: {
        likes: 0,
        description: '',
        owner: Fire.uid,
        categories: [],
        visible: true,
        uri: null
      },
      text: "",
      loading: false,
      selectedItems: [],
      starAmount: 50
    };
    stars = 50;
  }
  get stars() {
    return this.stars;
  }

  onChangeText = (text) => {
    let v = this.state.video;
    v.description = text;
    this.setState({ video: v });
  }
  updateTagState = (state) => {
    this.setState({
      tags: state
    })
  };

  onSelectedItemsChange = (selectedItems) => {
    let v = this.state.video;
    v.categories = selectedItems;
    this.setState({ video: v, selectedItems });
  }

  componentDidMount() {
    this.getPermissionAsync();
    this._pickImage();
    //this._pickImage();
    console.log('parametri ', this.props.route.params)
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: "black", height: "100%", display: "flex", marginTop: 20, }}>
        <View style={
          {
            position: "relative",
            backgroundColor: "white",
            borderBottomEndRadius: 48,
            borderBottomLeftRadius: 48,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            width: 60,
            marginBottom: 20
          }}>
          {/* <Text>chiudi</Text> */}
          <MaterialCommunityIcons name="arrow-collapse-down" size={24}
            color='#black'
            style={{ margin: 10 }} />
        </View>

        <View style={{
          padding: 10, flex: 1, flexDirection: "column",justifyContent:'flex-start'
        }}>
          {
            this.props.route.params?.sfida && (<Text h4>Lancia una sfida a {this.props.route.params?.utenteSfidato?.name}</Text>)
          }
          {
            this.props.route.params?.rispostaSfida && (<Text h4>Accetta la sfida di {this.props.route.params?.rispostaSfida?.sfidante?.name}</Text>)
          }
        <View style={{flexDirection:'row', borderBottomWidth:0.4,borderColor:'grey',}}>
        <View style={{
            marginBottom:10

          }}>
            <TouchableOpacity onPress={this._pickImage} style={
              {
                width: Dimensions.get('screen').width / 5,
                height: Dimensions.get('screen').width / 5,
                backgroundColor: "#0f0104",
                borderRadius: 10,
                overflow: "hidden",
                alignContent: "center",
                justifyContent: "center"
              }
            }>
              <Video source={{ uri: this.state.video?.uri }} resizeMode="cover" style={{
                height: Dimensions.get('screen').width / 2,
                width: Dimensions.get('screen').width / 2,
                zIndex: 3,
                position: "absolute",
                alignSelf: "center"
              }} />
            </TouchableOpacity>
          </View>

          <Input style={{marginLeft:10, width: Dimensions.get('screen').width - Dimensions.get('screen').width * 35 / 100, flex:1, borderWidth:0,backgroundColor:'black'}} placeholder="Descrizione..."    placeholderTextColor="#ffff"  right icon="text-fields" family="MaterialCommunityIcons" onChangeText={text => this.onChangeText(text)} />
        </View>
      
          <View style={{borderBottomColor:'grey', borderBottomWidth:0.5,}}>
          <SectionedMultiSelect
            items={items}
            uniqueKey="name"
            textColor="white"
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
            colors={{ primary: "black" }}
            styles={{
              selectToggle: {
                width: '90%',
                marginLeft:'auto',
                marginRight:'auto'
              },

              selectToggleText: {
                color: 'white',
                zIndex: 10,
                marginTop:20,
                marginBottom:20,
              }
            }}

          />
          </View>
        <View style={{borderBottomWidth:0.4,borderColor:'grey', }}> 
          <TagInput
              updateState={this.updateTagState}
              tags={this.state.tags}
              placeholder="Hastags"
              placeholderTextColor='white'
              tagStyle={styles.tag}
              tagTextStyle={styles.tagText}
              inputStyle={{color: 'white'}}
              containerStyle={{width:'97%',marginLeft:'auto',marginRight:'auto', marginTop:10,
            }}
            />
          </View>

          {this.props.route.params?.sfida && (<View style={{ width: "100%", marginTop:20,marginBottom:20,borderBottomWidth:0.5, borderColor:'grey' }}>
            <View style={{width: "92%",marginLeft:'auto',marginRight:'auto'}}>
            <Text style={{color:'white', fontSize:16}}> Difficoltà sfida: {this.state.starAmount} stelle</Text>
            <Slider
              maximumValue={500}
              minimumValue={10}
              value={this.state.starAmount}
              step={10}
              onValueChange={(val) => this.setState({ starAmount: val })}
              activeColor={'#ffff'}
              thumbStyle={{color:'white',borderColor:'white'}}
            //onSlidingComplete={(val) =>this.setState({starAmount:val})}
            />
            </View>
          </View>)}


          <Block center style={{marginTop:'auto'}}>

          <Button  size="small" color="white" round uppercase style={{ shadowColor: "#black", }} onPress={this._uploadVideo} loading={this.state.loading} ><Text style={{fontSize:18,fontWeight:'600'}}>CARICA</Text></Button>
          </Block>

        </View>
        {/* <View style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, position:"absolute",zIndex:-1 }}>
          <Image source={require('../assets/giphy.gif')}
            style={{ height: "100%", width: "100%" }} />
        </View> */}
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
    if (Constants.platform.ios)
    {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted')
      {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0,
      videoExportPreset: 2
    });
    console.log(result);

    if (!result.cancelled)
    {
      let v = this.state.video;
      v.uri = result.uri;
      this.setState({ video: v });
    }

  };


  _uploadVideo = async () => {
    var sfida = this.props.route.params?.sfida;
    var rispostaSfida = this.props.route.params?.rispostaSfida;

    this.setState({ loading: true });
    var this_ = this;
    var newvideo = this.state.video;
    newvideo.createdAt = new Date();
    if (!newvideo && !newvideo.uri) return;
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const user_id = firebase.auth().currentUser.uid;

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
      switch (snapshot.state)
      {
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
        newvideo.uri = downloadURL;
        return downloadURL;
      })
        .then(path => { return VideoThumbnails.getThumbnailAsync(path, { time: 1 }) })
        .then(res => { return fetch(res.uri); }).then(r => { return r.blob(); })
        .then(file => { return firebase.storage().ref().child(`@thumb-${ vid }`).put(file); })
        .then(snap => { return snap.ref.getDownloadURL(); })
        .then(url => {
          newvideo.thumbnail = url;

          // se è una sfida in fase di inizio
          if (sfida)
          {
            // come id della sfida sfruttiamo lo stesso generato per lo storage video
            newvideo.sfida = vid;
            newvideo.visible = false;
          }
          else if (rispostaSfida)
          {
            // la sfida è già presente
            newvideo.sfida = rispostaSfida.id;
            newvideo.visible = true;

            // la sfida è stata accettata, aggiorniamo la visibilità del video1
            // e la data di creazione - e la timeline dei follower (?)
            // TO-DO
          }

          return firebase.firestore().collection("videos").add(newvideo);
        })
        .then(docRef => {
          const us = this_.props.route.params?.utenteSfidato;
          const me = this_.props.global.user;
          // se è una sfida in fase di inizio
          if (sfida)
          {
            const newSfida = {
              video1_id: docRef.id,
              sfidante_id: user_id,
              createdAt: new Date(),
              sfidato_id: us?.id,
              sfidato: { name: us?.name },
              sfidante: { name: me?.name },
              status: "onCreating",
              threshold: this_.state.starAmount
            };
            firebase.firestore().collection("sfide").doc(vid).set(newSfida);
          }
          else if (rispostaSfida)
          {
            rispostaSfida.video2_id = docRef.id;
            rispostaSfida.status = 'pending';
            firebase.firestore().collection("sfide").doc(rispostaSfida.id).set(rispostaSfida);
          }

        })
        .then(() => {
          this_.setState({ loading: false });
          sfida ? alert("Sfida lanciata!") : alert("Caricamento riuscito");
          this_.props.navigation.goBack();
        })
        .catch(err => { console.log(err) });
    });
  };

}

export default withGlobalContext(PostScreen);

const styles = StyleSheet.create({
    textInput: {
      height: 40,
      borderColor: 'white',
      borderWidth: 1,
      marginTop: 8,
      borderRadius: 5,
      padding: 3,
    },
    tag: {
        backgroundColor: '#fff'
      },
    tagText: {
        color: 'black'
      },
});