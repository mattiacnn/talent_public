import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
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
import { withNavigation } from "react-navigation";

const dublicateItems = (arr, numberOfRepetitions) =>
    arr.flatMap(i => Array.from({ length: numberOfRepetitions }).fill(i));

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

const that = this;


class Home2Screen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            likecount: 200,
            commentcount: 9,
            videoNum: 0,
            currentIndex: 0,
            user: { user_videos: [] },
            refreshing: false,
            nome: this.props.route.params.nome,
            expoPushToken: '',
            notification: {},
            timeline: [],
            videoInfo: [],
            owner: [],
            feed: [],
            isPaused: false
        };
        this.handleClick = this.handleClick.bind(this);
        this._onRefresh = this._onRefresh.bind(this);

    }


    async componentDidMount() {
        //this._onRefresh();
        //firebase.auth().signOut()
        //this.animation.play();
        //this.getTimeline();
        // const id = firebase.auth().currentUser.uid;
        // var timelineFull = [];
        // const that = this;

        // firebase.firestore().collection('timelines').doc(id).collection("videos").get()
        //     .then(function (querySnapshot) {
        //         querySnapshot.forEach((doc, i) => {
        //             //console.log(" timeline", doc.data());
        //             timelineFull[i] = { ...doc.data() };
        //             firebase.firestore().collection('videos').doc(doc.data().idVideo).get()
        //                 .then(video => {
        //                     //console.log("video", video.data());
        //                     timelineFull[i] = { ...timelineFull[i], ...video.data() };
        //                     firebase.firestore().collection('users').doc(video.data().owner).get()
        //                         .then(user => {
        //                             //console.log('utente', user.data());
        //                             timelineFull[i] = { ...timelineFull[i], ...user.data() };
        //                         })
        //                         .then(()=> console.log("oggetto", i, timelineFull[i]))
        //                 })
        //         });
        //         that.setState({timeline: timelineFull}); 
        //     })
        //     .catch(function (error) {
        //         console.log("Error getting documents: ", error);
        //     });
        // var videos = [];
        // var user = [];

        // timeline.forEach((video) => {
        //     videos.push(this.fetchVideo(video.idVideo));
        // });

        // videos.forEach((video) => {
        //     Promise.resolve(video).then(result => {
        //         user.push(this.fetchUser(result.data().owner));
        //     })
        // });

        // var timeline = await Promise.resolve(this.fetchTimeline(Fire.uid));
        // //console.log('timeline:',timeline)
        // timeline.forEach((video,i) => {
        //     console.log('video',i,':',video.data())
        // })        
        var aux = [];
        var fullItem = [];
        var arrVideos = [];

        this.props.navigation.addListener(
            'didBlur', payload => {
                this.setState({
                    isPaused: true
                });
            });

        this.fetchTimeline(Fire.uid).then(videos => {

            videos.forEach(video => {
                const v = video.data();
                console.log(video.data());
                const userPromise = this.fetchUser(v.owner);
                const videoPromise = this.fetchVideo(v.idVideo);

                var user_video = { user: null, video: null };
                Promise.all([userPromise, videoPromise]).then(results => {
                    //console.log(results);
                    user_video.user = results[0].data();
                    user_video.video = results[1].data();
                    user_video.video.id = v.idVideo;
                    console.log('user video', user_video);
                    let currState = this.state.user.user_videos;
                    currState.push(user_video);
                    this.setState({ user: { ...this.state.user, user_video: currState } })
                    // results.forEach((result) => {
                    //     console.log('result', result.data());
                    // })
                });
            })
        })

        // .then( () => {

        //     arrVideos.forEach(video => {
        //         const userPromise = this.fetchUser(video.owner);
        //         const videoPromise = this.fetchVideo(video.idVideo);
        //         Promise.all(userPromise, videoPromise).then(results => {

        //             results.forEach((result) => {
        //                 console.log('result', result.data())
        //                 aux.push(result.data())
        //             })
        //             //console.log(aux)
        //             fullItem.push(aux)
        //         })
        //     })
        //     //console.log('full', fullItem)
        // })

    }

    async fetchTimeline(user) {
        return firebase.firestore().collection('timelines').doc(user)
            .collection('videos').get();
    }

    async fetchUser(user) {
        console.log('Fetching user id:', user);
        return firebase.firestore().collection('users').doc(user).get();
    }

    async fetchVideo(video) {
        console.log('Fetching video id:', video);
        return firebase.firestore().collection('videos').doc(video).get();
    }

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

    render() {

        const like = this.state.liked ? 'red' : 'white';

        let currentIndex = this.state.currentIndex;
        let videos = this.state.user.user_videos;

        var item = {};

        if (videos && !this.state.refreshing) {
            item = videos[currentIndex];
        }

        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };

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
                    {/* <Image source={require('../assets/tempImage1.jpg')}></Image> */}
                    <Video
                        source={{ uri: item?.uri }}
                        resizeMode="cover"
                        style={StyleSheet.absoluteFill}
                        isLooping
                        paused={this.state.isPaused} />
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
                                <Text style={styles.likecount}>{this.state.likecount}</Text>
                                <TouchableOpacity onPress={() => Actions.Comments()} >
                                    <Icon2 name="chat-bubble" size={40} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.commentcount}>{this.state.commentcount}</Text>
                                <TouchableOpacity>
                                    <Icon name="share" size={40} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.share}>share</Text>
                            </View>
                        </View>
                    </View>
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