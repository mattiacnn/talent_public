import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Share, Image,Alert} from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import anim from '../assets/lottie/play.json';
import Animation from 'lottie-react-native';
// import Swipeable from 'react-native-gesture-handler/Swipeable';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import Fire from "../Fire";
import firebase from 'firebase';
import 'firebase/firestore';
import * as Crypto from 'expo-crypto';

import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import Modal, { ModalContent, ModalTitle } from 'react-native-modals';
import { Item, Input } from 'native-base';
import { Snackbar } from 'react-native-paper';
import { withGlobalContext } from "../GlobalContext";
import { Keyboard } from 'react-native'
import {FontAwesome} from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
            video: { comments: [] },
            refreshing: false,
            nome: this.props.route.params.nome,
            expoPushToken: '',
            notification: {},
            comments: [],
            owner: [],
            feed: [],
            showComments: false,
            isPaused: true,
            play: true,
            commentsSubscribed: false,
            showToast: false

        };
        this.handleClick = this.handleClick.bind(this);
        this._onRefresh = this._onRefresh.bind(this);

    }
    _onDismissSnackBar = () => this.setState({ showToast: false });
    deleteComment = (id) => {
        
        firebase.firestore().collection("comments").doc(id).delete();
        this.setState({modalCancel:false})
    }
    onShare = async (uri) => {
        try {
            const result = await Share.share({
                message: 'Ciao! guarda il video che ho messo su talent',
                url: uri,

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

    async componentDidMount() {

        // var timeline = await Promise.resolve(this.fetchTimeline(Fire.uid));
        // //console.log('timeline:',timeline)
        // timeline.forEach((video,i) => {
        //     console.log('video',i,':',video.data())
        // })        
        var aux = [];
        var fullItem = [];
        var arrVideos = [];

        this._unsubscribe = this.props.navigation.addListener('blur', () => {
            // do something
            console.log("adios")
            this.setState({ isPaused: false })
        });

        this.props.navigation.addListener('focus', () => {
            // do something
            console.log("haloa")
            this.setState({ isPaused: true })
        });

        this.fetchTimeline(Fire.uid).then(videos => {

            videos.forEach(video => {
                const v = video.data();
                console.log(video.data());
                const userPromise = this.fetchUser(v.owner);
                const videoPromise = this.fetchVideo(v.idVideo);

                var user_video = { user: null, video: null };
                Promise.all([userPromise, videoPromise]).then(results => {
                    //console.log(results
                    user_video.user = results[0].data();
                    user_video.video = results[1].data();
                    user_video.video.id = v.idVideo;
                    user_video.user.id = v.owner;
                    console.log('user video', user_video);
                    let currState = this.state.user.user_videos;
                    currState.push(user_video);
                    this.setState({ user: { ...this.state.user, user_video: currState } })
                });
            })
        })

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
        this.setState({ myText: 'You swiped down!', currentIndex: this.state.currentIndex + 1 });
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

    handleModalComment = (video) => {
        //console.log(this.state.video);
        this.setState({ showComments: !this.state.showComments });
        firebase.firestore().collection("comments").where("video_id", "==", video.id)
            .get()
            .then((querySnapshot) => {
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
                this.setState({ video: { ...video, comments }, commentsSubscribed: true });
                console.log(this.state.video.comments)
            });
    }

    handleComment = (video) => {
        console.log(this.state.comment);
        if (firebase.firestore().collection("videos").doc(video.id) == false)
        {
            const newComment = {
                video_id: video.id,
                user_id: firebase.auth().currentUser.uid,
                user_avatar: this.props.global.user.avatar || null,
                author: `${this.props.global.user.name || null} ${this.props.global.user.surname || null}`,
                body: this.state.comment,
                timestamp: new Date().toLocaleDateString()
            }
            let comments = video.comments || [];
            comments.push(newComment);
            Keyboard.dismiss();
            this.setState({ video: { ...video, comments }, comment: '' });
            firebase.firestore().collection("comments").add(newComment);
        }
        else
        {
            Alert.alert(
                "Commenti disattivati",
                "l'autore del video ha disattivato i commenti",
                [
                  { text: "OK", onPress: () => console.log("OK Pressed") }
                ],
                { cancelable: false }
              );
        }
    }
    handleSfida = (user) => {

        // posta video sfida
        this.props.navigation.push('StartSfida',
        { sfida: true, utenteSfidato: user})
    }
    handleLike = (video, owner) => {

        const uId = firebase.auth().currentUser.uid;
        const vId = video;
        var docRef;
        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, `${uId}${vId}`)
            .then(hash => {
                docRef = firebase.firestore().collection("likes").doc(hash);
                return docRef.get();
            })
            .then((doc) => {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    this.setState({ showToast: true, message: 'Video già piaciuto' });
                } else {
                    docRef.set({ user_id: uId, video_id: vId, videoOwner_id: owner });
                    // update con transaction. Si dovrò fare con distributed counters
                    firebase.firestore().collection("videos").doc(vId)
                        .update({
                            likes: firebase.firestore.FieldValue.increment(1)
                        });
                }
            })
            .catch(function (error) {
                console.log("Error getting document:", error);
            });

    }

    goToUser = (user) => {
        console.log(user, 'UTENTE')
        this.props.navigation.push('Esplora', {
            screen: 'Utente',
            params: {
                user: user
            },
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
                    style={{ flex: 1}}
                >
                    {/* <Image source={require('../assets/tempImage1.jpg')}></Image> */}

                    <Video
                        source={{ uri: item?.video.uri }}
                        resizeMode="cover"
                        style={StyleSheet.absoluteFill}
                        isLooping
                        shouldPlay={this.state.isPaused}
                    />
                    <Snackbar
                        visible={this.state.showToast}
                        onDismiss={this._onDismissSnackBar}
                        duration={Snackbar.DURATION_SHORT}
                    >
                        {this.state.message}
                    </Snackbar>
                    <View style={styles.full}>
                        <View style={{ flex: .5, justifyContent: 'flex-end' }}>

                        </View>
                        <View style={{ flex: .5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <View>
                                <TouchableOpacity onPress={() => this.goToUser(item.user)}>
                                    <ImageBackground source={item?.user.avatar ? { uri: item.user.avatar } : require("../assets/tempAvatar.jpg")} style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 8,marginLeft:-5 }} imageStyle={{ borderRadius: 25 }}>
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Icon2 name="add-circle" size={20} color="#fb2956" />
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.handleLike(item?.video.id, item?.video.owner)}>
                                    <Icon name="star" size={40} color={like} />
                                </TouchableOpacity>
                                <Text style={styles.likecount}>{item?.video.likes}</Text>
                                <TouchableOpacity onPress={() => this.handleModalComment(item?.video)}>
                                    <MaterialCommunityIcons name="chat" color="white" size={40} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.onShare(item?.video.uri)}>
                                    <Icon name="share" size={40} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.handleSfida(item?.user)} style={{marginTop:10,marginLeft:10}}>
                                    <FontAwesome name="flash" color="red" size={40}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: .5, flexDirection: 'row', }}>
                        <View >
                            <View style={styles.tag}>
                                <Text style={styles.tagtitle}>@{item?.user.username}</Text>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.username}>{item?.description}</Text>
                            </ScrollView>
                        </View>
                    </View>
                </GestureRecognizer>

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
                                    <TouchableOpacity style={{ flexDirection: "row", marginTop: 10 }} onLongPress={() => this.setState({ modalCancel: true })}>
                                        <Modal
                                            animationType="fade"
                                            visible={this.state.modalCancel}
                                        >
                                            <View style={{ height: 100, width: 250, backgroundColor: "white", justifyContent: "center" }}>
                                                <TouchableOpacity style={{ margin: 5 }} onPress={() => this.setState({ modalCancel: false })}>
                                                    <Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Annulla</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={{ margin: 5 }} onPress={() => this.deleteComment(item.id)}>
                                                    <Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Cancella Commento</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={{ margin: 5 }}>
                                                    <Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Segnala</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </Modal>
                                        <Image style={{ height: 40, width: 40, borderRadius: 30 }} source={{ uri: item.user_avatar }} />
                                        <View style={{ flexDirection: "column", marginLeft: 30 }}>
                                            <View style={{ flexDirection: "row" }}>
                                                <Text style={{ fontWeight: "bold" }}>{item.author}</Text>
                                                <Text style={{ marginLeft: 10 }}>{item.body}</Text>
                                            </View>
                                            <Text style={{ fontSize: 12, color: "gray" }}>{item.timestamp}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            >
                            </FlatList>
                            <Item rounded style={{ flexDirection: "row", justifyContent: "space-around", marginHorizontal: 5, padding: 5 }}>
                                <Input placeholder='Inserisci commento' onChangeText={comment => this.setState({ comment })} />
                                <TouchableOpacity style={{ marginHorizontal: 5, marginRight: 15, padding: 10 }} onPress={() => this.handleComment (this.state.video)}>
                                    <Text style={{ fontWeight: "bold" }}>Pubblica</Text>
                                </TouchableOpacity>

                            </Item>
                        </ModalContent>
                    </KeyboardAwareScrollView>

                </Modal.BottomModal>
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
        backgroundColor: 'transparent',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop:100        
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

export default withGlobalContext(Home2Screen);