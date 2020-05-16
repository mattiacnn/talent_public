import React, { Component } from "react";
import { StyleSheet, Button, Share,StatusBar, Dimensions, SafeAreaView, TouchableOpacity, ImageBackground, View, Text,  } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Fire from "../Fire";
import { Image } from 'react-native';
import { Container, Header, DeckSwiper, Card, CardItem, Thumbnail, Left, Body, Item, Input } from 'native-base';
import { ScrollView, FlatList } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import anim from '../assets/lottie/play.json';
import Animation from 'lottie-react-native';
import { Actions } from 'react-native-router-flux';
import Modal, { SlideAnimation, ModalContent, ModalTitle } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from 'expo-video-player';
import * as Crypto from 'expo-crypto';
import { Snackbar } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { withGlobalContext } from "../GlobalContext";
import { Keyboard } from 'react-native'

const playButton = (<Icon2 name="chat-bubble" size={40} color="white" />);

const COLOR = 'white';
const icon = (name, size = 36) => () => (
    <Ionicons
        name={name}
        size={size}
        color={COLOR}
        style={{ textAlign: 'center' }}
    />
);

class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: this.props.route.params.owner,
            showComments: false,
            video: this.props.route.params.video,
            showToast: false,
            commentsSubscribed: false,
            modalCancel: false,
            cancelComment: "Elimina Commento"
        };
    }

    _onDismissSnackBar = () => this.setState({ showToast: false });

    handleModalComment = () => {
        console.log(this.state.video);
        this.setState({ showComments: !this.state.showComments });
        if (!this.state.commentsSubscribed) {
            firebase.firestore().collection("comments").where("video_id", "==", this.state.video.id)
                .onSnapshot((querySnapshot) => {
                    //console.log(querySnapshot);
                    var comments = [];
                    querySnapshot.forEach(function (doc) {
                        // doc.data() is never undefined for query doc snapshots
                        let commentsC = doc.data();
                        commentsC.id = doc.id;
                        comments.push(commentsC);
                        console.log(comments)
                        //console.log(doc.id, " => ", doc.data());
                    });
                    this.setState({ video: { ...this.state.video, comments }, commentsSubscribed:true });
                    console.log(this.state.video.comments)
                });
        }
    }


    handleComment = () => {
        console.log(this.state.comment);
        const newComment = {
            video_id:this.state.video.id,
            user_id: firebase.auth().currentUser.uid,
            user_avatar: this.props.global.user.avatar || null,
            author: `${this.props.global.user.name || null} ${this.props.global.user.surname || null}`,
            body: this.state.comment,
            timestamp: new Date().toLocaleDateString()
        }
        let comments = this.state.video.comments;
        comments.push(newComment);
        Keyboard.dismiss();
        this.setState({ video: { ...this.state.video, comments }, comment:'' });
        firebase.firestore().collection("comments").add(newComment);
    }

    handleLike = () => {
        //console.log(this.state.user)
        console.log(this.state.user.id);
        console.log(this.state.video?.id || 'iddidefault');
        console.log(firebase.auth().currentUser.uid);

        const uId = firebase.auth().currentUser.uid;
        const vId = this.state.video?.id || 'iddidefault';
        var docRef;
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, `${uId}${vId}` )
            .then(hash => {
                docRef = firebase.firestore().collection("likes").doc(hash);
                return docRef.get();
            })
            .then((doc) => {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    this.setState({ showToast: true, message: 'Video già piaciuto' });
                } else {
                    docRef.set({ user_id: uId, video_id: vId, videoOwner_id:this.state.user.id});
                    // update con transaction. Si dovrò fare con distributed counters
                    firebase.firestore().collection("videos").doc(vId)
                    .update({
                        likes: firebase.firestore.FieldValue.increment(1)
                    });
                    this.setState({video:{...this.state.video, likes: this.state.video.likes +1}});
                }
                this._handleNotification
            })
            .catch(function (error) {
                console.log("Error getting document:", error);
            });

    }


    _handleNotification = notification => {
        Vibration.vibrate();
        console.log(notification);
        this.setState({ notification: notification });
      };
    
      deleteComment = (id) => {
        
          firebase.firestore().collection("comments").doc(id).delete();
          this.setState({modalCancel:false})
      }
      // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
      sendPushNotification = async (msg) => {
        const message = {
          to: "ExponentPushToken[VPAE7YNZACQrlBaKeJf8a7]",
          sound: 'default',
          title:  `Nuovo messaggio da`,
          body: "msg",
          data: { data: 'goes here' },
          _displayInForeground: true,
        };
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      };
      onShare = async () => {
        try {
          const result = await Share.share({
            message: 'Ciao! guarda il video che ho messo su talent'  ,
            url: this.state.video.uri,

          });
    
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          alert(error.message);
        }
      };
    render() {

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>

                <VideoPlayer
                    playIcon={icon('ios-play')}
                    pauseIcon={icon('ios-pause')}
                    fullscreenEnterIcon={icon('ios-expand', 28)}
                    fullscreenExitIcon={icon('ios-contract', 28)}
                    showFullscreenButton={true}

                    videoProps={{
                        source: { uri: this.state.video?.uri },
                        rate: 1.0,
                        volume: 1.0,
                        isMuted: false,
                        resizeMode: "cover",
                        shouldPlay: true,
                        isLooping: false,
                    }}
                />
                <Snackbar
                    visible={this.state.showToast}
                    onDismiss={this._onDismissSnackBar}
                    duration={Snackbar.DURATION_SHORT}
                >
                    {this.state.message}
                </Snackbar>
                <View style={{ position: "absolute", right: 10, top: Dimensions.get('screen').height/2.5, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>

                    <View>
                        <TouchableOpacity>
                            <ImageBackground source={
                                this.state.user?.avatar
                                    ? { uri: this.state.user.avatar }
                                    : require("../assets/tempAvatar.jpg")
                            }style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 8 }} imageStyle={{ borderRadius: 25 }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <Icon2 name="add-circle" size={20} color="#fb2956" />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>

                    <View>
                    <TouchableOpacity onPress={this.handleLike} style={styles.icon}>
                            <Icon name="star" size={40} color={COLOR} />
                        </TouchableOpacity>
                        <Text style={styles.counter}>{this.state.video?.likes}</Text>
                        <TouchableOpacity onPress={this.handleModalComment} style={styles.icon}>
                            <Icon2 name="chat-bubble" size={40} color={COLOR} />
                        </TouchableOpacity>
                        <Text style={styles.counter}>{this.state.video.comments?.length ? this.state.video.comments.length : 0}</Text>
                        <TouchableOpacity onPress={() => this.onShare()}>
                                    <Icon name="share" size={40} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.share}>share</Text>
                    </View>
                </View>

                <View style={{ position: "absolute", bottom: 50, left: 0 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.username}>{this.state.video.description ? this.state.video.description : ''}</Text>
                    </ScrollView>
                </View>

                <Modal.BottomModal
                    visible={this.state.showComments}
                    onTouchOutside={() => this.setState({ showComments: false })}
                    height={0.8}
                    width={1}
                    onSwipeOut={() => this.setState({ showComments: false })}
                    modalTitle={
                        <ModalTitle
                            title="Commenti"
                            hasTitleBar
                        />
                    }
                >
                    <KeyboardAwareScrollView
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.container}
                        scrollEnabled={true}
                    >
                        <ModalContent
                            style={{
                                flex: 1,
                                backgroundColor: 'fff',
                            }}
                        >
                            <FlatList
                                numColumns={1}
                                data={this.state.video.comments ? this.state.video.comments : []}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={{flexDirection:"row", marginTop:10}} onLongPress={() =>   this.setState({modalCancel: true}) }>
                                        <Modal
                                            animationType="fade"
                                            visible={this.state.modalCancel}                                           
                                        >
                                            <View  style={{height:100,width:250,backgroundColor:"white",justifyContent:"center"}}>
                                                <TouchableOpacity style={{margin:5}} onPress={() => this.setState({modalCancel:false})}>
                                                    <Text style={{textAlign:"center",  fontWeight:'500',fontSize:16,color:"black"}}>Annulla</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={{margin:5}} onPress={() => this.deleteComment(item.id)}>
                                                    <Text style={{textAlign:"center",  fontWeight:'500',fontSize:16,color:"black"}}>Cancella Commento</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={{margin:5}}>
                                                    <Text style={{textAlign:"center",  fontWeight:'500',fontSize:16,color:"black"}}>Segnala</Text>
                                                </TouchableOpacity>                                                    

                                            </View>
                                        </Modal>
                                        <Image style={{height:40,width:40,borderRadius:30}} source = {{uri:item.user_avatar}}/>
                                        <View style={{flexDirection:"column",marginLeft:30}}>
                                            <View style={{flexDirection:"row"}}>
                                                <Text style={{fontWeight:"bold"}}>{item.author}</Text>
                                                <Text style={{marginLeft:10}}>{item.body}</Text>
                                            </View>
                                            <Text style={{fontSize:12, color:"gray"}}>{item.timestamp}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            >
                            </FlatList>
                            <Item rounded style={{ flexDirection: "row", justifyContent: "space-around", marginHorizontal: 5,padding:5 }}>
                                <Input placeholder='Inserisci commento' onChangeText={comment => this.setState({ comment })} />
                                <TouchableOpacity style={{ marginHorizontal: 5,marginRight:15,padding:10 }} onPress={this.handleComment}>
                                    <Text style={{ fontWeight: "bold" }}>Pubblica</Text>
                                </TouchableOpacity>
                                
                            </Item>
                        </ModalContent>
                    </KeyboardAwareScrollView>

                </Modal.BottomModal>
            </SafeAreaView>
        )
    }
}

export default withGlobalContext(VideoScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    full: {
        flex: 1,
    },
    rightside: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        margin: 8
    },
    leftside: {
        alignItems: 'flex-start'
    },
    rightcontent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    counter: {
        color: COLOR,
        textAlign: "center",
        marginBottom: 8
    },
    share: {
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagtitle: {

        padding: 10,
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'

    },
    tag: {
        backgroundColor: '#f20b3a',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    username: {
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 16
    },
    commentsBottom: {
        color: 'white',
        marginLeft: 8
    },
    userimage: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2
    },
    icon: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    }

});