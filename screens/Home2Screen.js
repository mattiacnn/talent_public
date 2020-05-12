import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image,Dimensions,Share } from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import anim from '../assets/lottie/play.json';
import Animation from 'lottie-react-native';
import { Actions } from 'react-native-router-flux';
// import Swipeable from 'react-native-gesture-handler/Swipeable';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import Fire from "../Fire";
import firebase from 'firebase';
import 'firebase/firestore';

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { FlatList } from 'react-native-gesture-handler';
import { reset } from 'expo/build/AR';
import Modal, { SlideAnimation, ModalContent, ModalTitle } from 'react-native-modals';

const dublicateItems = (arr, numberOfRepetitions) =>
    arr.flatMap(i => Array.from({ length: numberOfRepetitions }).fill(i));

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}


class Home2Screen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            likecount: 200,
            commentcount: 9,
            videoNum: 0,
            currentIndex: 0,
            user: { user_videos: null },
            refreshing: false,
            nome: this.props.route.params.nome,
            expoPushToken: '',
            notification: {},
            timeline: [],
            videoInfo: [],
            owner: [],
            feed:[],
        };
        this.handleClick = this.handleClick.bind(this);
        this._onRefresh = this._onRefresh.bind(this);

    }


    
    async componentDidMount() {
        //this._onRefresh();
        //firebase.auth().signOut()
        //this.animation.play();
        //this.getTimeline();
        const id = firebase.auth().currentUser.uid;
        var timelineFull = [];
        const that = this;
        //PRENDI LA COLLECTION TIMELINES CON ID ID DELL'UTENTE E PRENDI  COLLECTION VIDEOS
        firebase.firestore().collection("timelines").doc(id).collection("videos").get().
        then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                var timeline = doc.data();

                that.setState({
                    feed: [ ...that.state.feed, timeline ]
                  })

                console.log(doc.id, " => ", doc.data());
            });
            console.log(that.state.feed)

        });
        //PER OGNI VIDEO OTTENUTO VAI NELLA COLLECTION VIDEOS E TRAMITE L'ID OTTENUTO PRENDI I VIDEO

        //FAI LO STESSO CON L'UTENTE

        /*{firebase.firestore().collection('timelines').doc(id).collection("videos").get()
            .then(function (querySnapshot) {
                querySnapshot.forEach((doc) => {
                    //console.log(" timeline", doc.data());
                    timelineFull = { ...doc.data() };
                    firebase.firestore().collection('videos').doc(doc.data().idVideo).get()
                        .then(video => {
                            //console.log("video", video.data());
                            timelineFull = { ...timelineFull, ...video.data() };
                            firebase.firestore().collection('users').doc(video.data().owner).get()
                                .then(user => {
                                    //console.log('utente', user.data());
                                    timelineFull = { ...timelineFull, ...user.data() };
                                })
                                .then(()=>that.setState({feed:timelineFull}), console.log(timelineFull))
                        })
                });
                
             })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });}

        var videos = [];
        var user = [];

        timeline.forEach((video) => {
            videos.push(this.fetchVideo(video.idVideo));
        });

        videos.forEach((video) => {
            Promise.resolve(video).then(result => {
                user.push(this.fetchUser(result.data().owner));
            })
        });*/

    }

    fetchTimeline() {
        const id = firebase.auth().currentUser.uid;
        firebase.firestore().collection('timelines').doc(id).get();
    }

    async fetchVideo(video) {
        return firebase.firestore().collection('videos').doc(video).get();
    }

    async fetchUser(user) {
        return firebase.firestore().collection('users').doc(user).get();
    }

    /*{ getTimeline = async () => {
 
         const that = this;
         const id = firebase.auth().currentUser.uid;
 
         var timeline = [];
         // GET TIMLINE WITH VIDEO ID
         firebase.firestore().collection("timelines").doc(id).collection("videos").get()
             .then(function (querySnapshot) {
 
                 querySnapshot.forEach(function (doc) {
                     var item = { tl: doc.data() };
                     //console.log(doc.id, " TIMELINE ", doc.data());
                     // GET ALL VIDEO INFORMATION   
                     firebase.firestore().collection("videos").doc(doc.data().idVideo).get().then(function (doc) {
                         if (doc.exists) {
                             item.videoInfo = doc.data();
                             //console.log("Document data:", doc.data());
                             // GET USER VIDEO INFO
                             firebase.firestore().collection("users").doc(doc.data().owner).get().then(function (doc) {
                                 if (doc.exists) {
                                     item.userInfo = doc.data();
                                     //console.log("USERS data:", doc.data());
                                 }
                                 else {
                                     console.log("NO USER FOUND")
                                 }
                             })
                         }
                         else {
                             console.log("no data found")
                         }
                     });
 
                     //JOIN VIDEO AND USER INFO
                     timeline.push(item);
                 })
 
                 console.log('scaricati ', timeline)
             })
     }
 }*/
    handleClick() {
        this.setState({
            liked: !this.state.liked,
            likecount: this.state.likecount + 1,
            videoNum: this.state.videoNum + 1
        });
    }
    renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        return (
            <Text>Ciao</Text>
        );
    }

    onSwipeUp(gestureState) {
        this.setState({ myText: 'You swiped up!', currentIndex: this.state.currentIndex - 1 });
    }

    onSwipeDown(gestureState) {
        this.setState({ myText: 'You swiped down!', currentIndex: this.state.currentIndex + 1 });
    }

    onSwipeLeft(gestureState) {
        this.setState({ myText: 'You swiped left!', currentIndex: this.state.currentIndex + 1 });
    }

    onSwipeRight(gestureState) {
        this.setState({ myText: 'You swiped right!', currentIndex: this.state.currentIndex - 1 });
    }

    onSwipe = (gestureName, gestureState) => {
        if (!this.state.user.user_videos) {
            return
        }
        if (this.state.currentIndex >= this.state.user.user_videos.length) {
            this.setState({ currentIndex: 0 });
        }
        // const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        // this.setState({ gestureName: gestureName });
        // switch (gestureName) {
        //     case SWIPE_UP:
        //         this.setState({ backgroundColor: 'red' });
        //         break;
        //     case SWIPE_DOWN:
        //         this.setState({ backgroundColor: 'green' });
        //         break;
        //     case SWIPE_LEFT:
        //         this.setState({ backgroundColor: 'blue' });
        //         break;
        //     case SWIPE_RIGHT:
        //         this.setState({ backgroundColor: 'yellow' });
        //         break;
        // }
    }

    promisedSetState = (newState) => {
        return new Promise((resolve) => {
            this.setState(newState, () => {
                resolve()
            });
        });
    }

    _onRefresh = () => {
        this.setState({
            refreshing: true
        });

        const id = firebase.auth().currentUser.uid;

        firebase.firestore().collection('users').doc(id).get()
            .then(doc => {

                const newState = {
                    user: doc.data(),
                    refreshing: false
                };

                this.promisedSetState(newState).then(() => {
                    let user = this.state.user;
                    //user.user_videos = dublicateItems(user.user_videos, 33);
                    this.setState({ user: user });
                });

            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }
    handleModalComment = () => {
        console.log(this.state.video);
        this.setState({ showComments: !this.state.showComments });
        if (!this.state.commentsSubscribed) {
            firebase.firestore().collection("comments").where("video_id", "==", this.state.feed.idVideo)
                .onSnapshot((querySnapshot) => {
                    //console.log(querySnapshot);
                    var comments = [];
                    querySnapshot.forEach(function (doc) {
                        // doc.data() is never undefined for query doc snapshots
                        comments.push(doc.data());
                        //console.log(doc.id, " => ", doc.data());
                    });
                    this.setState({ video: { ...this.state.video, comments }, commentsSubscribed:true });
                });
        }
    }

    handleComment = () => {
        console.log(this.state.comment);
        const newComment = {
            video_id:this.state.feed.idVideo,
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

    onShare = async (video) => {
        try {
          const result = await Share.share({
            message: 'Ciao! guarda questo video su talent'  ,
            url: video,

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

        const like = this.state.liked ? 'red' : 'white';

        let currentIndex = this.state.currentIndex;
        let videos = this.state.feed;

        var item = this.state.feed;
     
        if (videos && !this.state.refreshing) {
            item = videos[currentIndex];
        }

        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
        const categorie = [
            {
                id: '1',
                name: 'New Entry',
            },
        ]
        return (

            <View style={styles.container}>       
               <GestureRecognizer
                    onSwipe={(direction, state) => this.onSwipe(direction, state)}
                    onSwipeUp={(state) => this.onSwipeUp(state)}
                    onSwipeDown={(state) => this.onSwipeDown(state)}
                    onSwipeLeft={(state) => this.onSwipeLeft(state)}
                    onSwipeRight={(state) => this.onSwipeRight(state)}
                    config={config}
                    style={{ flex: 1, }}
                >
                    <Video source={{ uri: item?.uriVideo }} resizeMode="cover" style={StyleSheet.absoluteFill} isLooping  />
                    <View style={styles.full}>
                        <View style={{ flex: .5, justifyContent: 'flex-end' }}>

                        </View>
                        <View style={{ flex: .5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <View>
                                <TouchableOpacity>
                                    <ImageBackground source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKoh_wxk-fkGGHm4pP_Mwe6v-P6weOYRpuchqAu0K0VYoDj4AVQg' }} style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 8 }} imageStyle={{ borderRadius: 25 }}>
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Icon2 name="add-circle" size={20} color="#fb2956" />
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.handleClick}>
                                    <Icon name="star" size={40} color={like} />
                                </TouchableOpacity>
                                <Text style={styles.likecount}>4</Text>
                                <TouchableOpacity onPress={this.handleModalComment} >
                                    <Icon2 name="chat-bubble" size={40} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.commentcount}>7</Text>
                                <TouchableOpacity onPress={() => this.onShare(item?.uriVideo)}> 
                                    <Icon name="share" size={40} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.share}>share</Text>
                            </View>
                        </View>
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
                </Modal.BottomModal>

                    <View style={{ flex: .5, flexDirection: 'row' }}>
                        <View style={{ flex: .5 }}>
                            <View style={styles.tag}>
                                <Text style={styles.tagtitle}>{this.state.nome}</Text>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.username}>{item?.description}</Text>
                            </ScrollView>
                        </View>
                        <View style={{ flex: .5, justifyContent: 'flex-end' }}>
                            <View style={{ margin: 12, alignItems: 'flex-end', }}>
                                <Animation
                                    ref={animation => {
                                        this.animation = animation;
                                    }}
                                    style={{
                                        width: 50,
                                        height: 50
                                    }}
                                    loop={true}
                                    source={anim}
                                />
                            </View>
                        </View>
                    </View>
                                </GestureRecognizer>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    full: {
        flex: 1,
        flexDirection: 'row'
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
    likecount: {
        color: 'white',
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    commentcount: {
        color: 'white',
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
    }


});

export default Home2Screen;