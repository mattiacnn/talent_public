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

const dublicateItems = (arr, numberOfRepetitions) =>
    arr.flatMap(i => Array.from({ length: numberOfRepetitions }).fill(i));

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

const cards = [
    {
        text: 'Card One',
        name: 'One',
        uri: require('../assets/sample1.mp4'),
    },
    {
        text: 'Card Two',
        name: 'Two',
        uri: require('../assets/sample2.mp4'),
    },
    {
        text: 'Card tre',
        name: 'tre',
        uri: require('../assets/sample1.mp4'),
    },
];

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
        };
        this.handleClick = this.handleClick.bind(this);
        this._onRefresh = this._onRefresh.bind(this);

    }
    componentDidMount() {
        this._onRefresh();
        this.animation.play();
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

                console.log(this.state.user);
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
                    <Video source={{ uri: item?.uri }} resizeMode="cover" style={StyleSheet.absoluteFill} shouldPlay isLooping />
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
                                    <Icon name="heart" size={40} color={like} />
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
        <Text style={styles.tagtitle}>{this.user?.username}</Text>
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