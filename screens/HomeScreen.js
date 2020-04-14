import React, { Component } from "react";
import { StyleSheet, Button, StatusBar, Dimensions } from "react-native";
import *as firebase from "firebase";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Fire from "../Fire";
// import { DeckSwiper, Block } from 'galio-framework';
import { Image } from 'react-native';
import { Container, Header, View, DeckSwiper, Card, CardItem, Thumbnail, Text, Left, Body, Icon } from 'native-base';

var elements = [
    <View style={{ backgroundColor: '#B23AFC', height: 250, width: 250 }}>
        <Text>You wanna see a cool component?</Text>
        <Text>Galio has this cool Deck Swiper</Text>
    </View>,
    <View style={{ backgroundColor: '#FE2472', height: 250, width: 250 }}>
        <Text>What did you expect?</Text>
        <Text>This React Native component works perfectly</Text>
    </View>,
    <View style={{ backgroundColor: '#FF9C09', height: 250, width: 250 }}>
        <Text>Maybe you want to build the next Tinder</Text>
    </View>,
    <View style={{ backgroundColor: '#45DF31', height: 250, width: 250 }}>
        <Text>or maybe you just want a nice deck swiper component</Text>
        <Text>Galio has everything sorted out for you</Text>
    </View>
];

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

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: { followers: { id_users: [] }, followed: { id_users: [] }, avatar: null },
            refreshing: false,
            isImageAvailable: false,
            visible: false,
            dataSource: [],
            selectedVideo: null,
            newPassword: "",
            currentPassword: ""
        };
    }

    render() {

        let sources = elements;
        if (this.state.user.user_videos) {
            sources = this.state.user.user_videos;
        }

        return (
            <View style={{ padding: 10 }}>
                {/* <DeckSwiper
                    dataSource={cards}
                    renderItem={item =>
                        <Card style={{ elevation: 3 }}>
                            <CardItem>
                                <Left>
                                    <Thumbnail source={item.image} />
                                    <Body>
                                        <Text>{item.text}</Text>
                                        <Text note>NativeBase</Text>
                                    </Body>
                                </Left>
                            </CardItem>
                            <CardItem cardBody>
                                <Video
                                    source={item.uri}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    shouldPlay
                                    isLooping={false}
                                    style={{ height: Dimensions.get('window').height -80, flex: 1, width:320 }}
                                />
                            </CardItem>
                            <CardItem>
                                <Icon name="heart" style={{ color: '#ED4A6A' }} />
                                <Text>{item.name}</Text>
                            </CardItem>
                        </Card>
                    }
                /> */}
            </View>
        );
    }

    componentDidMount() {
        this.checkIfLoggedIn();
        // this.getPermissionAsync();
        //this._onRefresh();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                this.props.navigation.navigate('Login');
            }
        }.bind(this)
        );
    }

    _onRefresh = () => {
        var that = this;

        this.setState({
            ...this.state,
            refreshing: true
        });

        let id = firebase.auth().currentUser.uid;

        firebase.firestore().collection('users').doc(id).get()
            .then(doc => {
                console.log(doc.id, doc.data());

                this.setState({
                    ...this.state,
                    user: doc.data(),
                    refreshing: false
                });
                console.log(this.state.user);
            })
            .then(() => {
                let videos = that.state.user.user_videos;
                videos.forEach((video) => {
                    elements.push(
                        < View style={{ height: 250, width: 250 }}>
                            <Video
                                source={{ uri: video.uri }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                resizeMode="cover"
                                shouldPlay
                                isLooping
                                style={{ width: 300, height: 300 }}
                            />
                            <Text>{video.description}</Text>
                            <Text>{video.likes}</Text>
                        </View >
                    )
                })


            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#F9F8F8',
    }
});
