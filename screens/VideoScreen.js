import React, { Component } from "react";
import { StyleSheet, Button, StatusBar, Dimensions, SafeAreaView, TouchableOpacity, ImageBackground } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Fire from "../Fire";
// import { DeckSwiper, Block } from 'galio-framework';
import { Image } from 'react-native';
import { Container, Header, View, DeckSwiper, Card, CardItem, Thumbnail, Text, Left, Body } from 'native-base';
import { ScrollView, FlatList } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import anim from '../assets/lottie/play.json';
import Animation from 'lottie-react-native';
import { Actions } from 'react-native-router-flux';
import Modal, { SlideAnimation, ModalContent, ModalTitle } from 'react-native-modals';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from 'expo-video-player'

const playButton = (<Icon2 name="chat-bubble" size={40} color="white" />);

const COLOR = '#EA1043';
const icon = (name, size = 36) => () => (
    <Ionicons
        name={name}
        size={size}
        color={COLOR}
        style={{ textAlign: 'center' }}
    />
);
export default class VideoScreen extends React.Component {

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
            showComments: false
        };
    }

    render() {
        
        const { video } = this.props.navigation.state.params;
        const commentsList = video.comments ? video.comments : [];

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
                <VideoPlayer
                    playIcon={icon('ios-play')}
                    pauseIcon={icon('ios-pause')}
                    fullscreenEnterIcon={icon('ios-expand', 28)}
                    fullscreenExitIcon={icon('ios-contract', 28)}
                    showFullscreenButton={true}

                    videoProps={{
                        source: { uri: video?.uri },
                        rate: 1.0,
                        volume: 1.0,
                        isMuted: false,
                        resizeMode: "cover",
                        shouldPlay: true,
                        isLooping: false,
                    }}
                />

                <View style={{ position: "absolute", right: 10, top: 100, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>

                    <View>
                        <TouchableOpacity>
                            <ImageBackground source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKoh_wxk-fkGGHm4pP_Mwe6v-P6weOYRpuchqAu0K0VYoDj4AVQg' }} style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 8 }} imageStyle={{ borderRadius: 25 }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <Icon2 name="add-circle" size={20} color="#fb2956" />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity onPress={this.handleClick}>
                            <Icon name="heart" size={40} color='red' />
                        </TouchableOpacity>
                        <Text style={styles.likecount}>{this.state.likecount}</Text>
                    </View>

                    <View>
                        <TouchableOpacity onPress={() => this.setState({ showComments: !this.state.showComments })} >
                            <Icon2 name="chat-bubble" size={40} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.commentcount}>{this.state.commentcount}</Text>
                    </View>

                </View>

                <Modal.BottomModal
                    visible={this.state.showComments}
                    onTouchOutside={() => this.setState({ showComments: false })}
                    height={0.5}
                    width={1}
                    onSwipeOut={() => this.setState({ showComments: false })}
                    modalTitle={
                        <ModalTitle
                            title="Commenti"
                            hasTitleBar
                        />
                    }
                >
                    <ModalContent
                        style={{
                            flex: 1,
                            backgroundColor: 'fff',
                        }}
                    >
                        <FlatList
                            numColumns={1}
                            data={commentsList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View>
                                    <Text p>{item.author}</Text>
                                    <Text p>{item.body}</Text>
                                </View>
                            )}
                        >
                        </FlatList>
                    </ModalContent>
                </Modal.BottomModal>
            </SafeAreaView>
        )
    }
}


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