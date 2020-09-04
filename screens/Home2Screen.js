import React, { Component } from "react";
import {
    Text,
    Dimensions,
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Share,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar
} from "react-native";
import firebase from "firebase";
import ViewPager from "@react-native-community/viewpager";
import { Video } from "expo-av";
import styled from "styled-components/native";
import Fire from "../Fire";

import Tabs from '../components/Tabs'
import Info from "../components/Info";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { LinearGradient } from "expo-linear-gradient";

import api from "../services/api";

const Container = styled.View`
  flex: 1;
  background: transparent;
`;

const { height } = Dimensions.get("window");

const ViewPagerContainer = styled(ViewPager)`
  height: ${height }px;
`;

const Poster = styled.ImageBackground`
  height: 100%;
`;
const Gradient = styled(LinearGradient)`
  height: 100%;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
`;
const Center = styled.View`
  flex: 1;
  flex-direction: row;
`;

function objToAPI(obj) {
    const item = {
        id: obj.videoDocId,
        video: obj.uri,
        poster: obj.thumbnail,
        user: {
            email: obj.email,
            username: obj.username,
            description: obj.description,
            avatar: obj.avatar,
            id: obj.userDocId,
            token: obj.token,
            name: obj.name
        },
        count: {
            like: obj.likes,
            comment: obj.comments || 0,
            share: 2800
        }
    };

    return item;
}

let data = [];

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            selected: 0,
            videos: [],
            users: [],
            shouldPlay: false
        };
    }


    async fetchTimeline(user) {
        return firebase
            .firestore()
            .collection("timelines")
            .doc(user)
            .collection("videos")
            .get();
    }

    async fetchUser(user) {
        return firebase
            .firestore()
            .collection("users")
            .doc(user)
            .get();
    }

    async fetchVideo(video) {
        return firebase
            .firestore()
            .collection("videos")
            .doc(video)
            .get();
    }

    globalFeed = async () => {
        try
        {
            //QUERY ALL THE VIDEOS 
            const videoSnapshot = await firebase
                .firestore()
                .collection("videos")
                .get();

            const videosArr = await Promise.all(
                videoSnapshot.docs.map(async videoDoc => {
                    const videoData = { videoDocId: videoDoc.id, ...videoDoc.data() };
                    //QUERY THE AUTHOR DATA FOR EVERY VIDEO
                    const userDoc = await firebase
                        .firestore()
                        .collection("users")
                        .doc(videoData.owner)
                        .get();

                    if (userDoc.exists)
                    {
                        const userData = { userDocId: userDoc.id, ...userDoc.data() };
                        const mergeData = { ...userData, ...videoData };

                        const reqObj = objToAPI(mergeData);
                        return reqObj;
                    } else
                    {
                        return false;
                    }
                })
            );
            const filteredVideos = await videosArr.filter(obj => {
                if (obj)
                {
                    return true;
                }
            });
            this.setState({ datas: filteredVideos }, () => { });
        } catch (err)
        {
            console.log("err", err);
        }
        // xecute it
    };
    globalFeedSnapshot = async () => {
        try
        {
            //QUERY ALL THE VIDEOS 
            await firebase
                .firestore()
                .collection("videos").onSnapshot(async videoSnapshot => {

                    const videosArr = await Promise.all(
                        videoSnapshot.docs.map(async videoDoc => {
                            const videoData = { videoDocId: videoDoc.id, ...videoDoc.data() };
                            //QUERY THE AUTHOR DATA FOR EVERY VIDEO
                            const userDoc = await firebase
                                .firestore()
                                .collection("users")
                                .doc(videoData.owner)
                                .get();

                            if (userDoc.exists)
                            {
                                const userData = { userDocId: userDoc.id, ...userDoc.data() };
                                const mergeData = { ...userData, ...videoData };

                                const reqObj = objToAPI(mergeData);
                                return reqObj;
                            } else
                            {
                                return false;
                            }
                        })
                    );
                    const filteredVideos = await videosArr.filter(obj => {
                        if (obj)
                        {
                            return true;
                        }
                    });
                    this.setState({ datas: filteredVideos }, () => { });
                });

        } catch (err)
        {
            console.log("err", err);
        }
        // xecute it
    };

    componentDidMount() {
        this.globalFeedSnapshot();
        this.navBlur = this.props.navigation.addListener("blur", () => {
            this.setState({ shouldPlay: false })
        });
        this.navFocus = this.props.navigation.addListener("focus", () => {
            setTimeout(() => {
                this.setState({ shouldPlay: true })
            }, 200)
        });

    }
    //
    componentWillUnmount() {
        console.log(this.navBlur(), "navBlur")
        this.navBlur();
        this.navFocus();
    }
    render() {
        if (this.state.datas.length > 0)
        {
            return (
                <>
                    <StatusBar
                        translucent
                        backgroundColor="transparent"
                        barStyle="light-content"
                    />
                    <Container>
                        <Header />

                        <ViewPagerContainer
                            scrollEnabled={true}
                            pageMargin={0}
                            initialPage={0}
                            style={{ flex: 1 }}
                            orientation="horizontal"
                            onPageSelected={(e) => {
                                this.setState({ selected: e.nativeEvent.position })
                            }
                            }
                        >
                            {this.state.datas.map((item, index) => {
                                const { user } = item;
                                const { avatar } = user;
                                return (
                                    <View style={styles.container} key={index}>
                                        <Video
                                            source={{ uri: item.video }}
                                            rate={1.0}
                                            volume={1.0}
                                            isMuted={false}
                                            isLooping
                                            resizeMode="cover"
                                            shouldPlay={this.state.selected == index && this.state.shouldPlay}
                                            style={{ width: "100%", height: "100%" }}
                                            posterSource={{ uri: item.poster }}
                                            onTouchEnd={() => this.setState((p) => ({ shouldPlay: !p.shouldPlay }))}
                                        />
                                        <Gradient
                                            locations={[0, 0.26, 0.6, 1]}
                                            colors={[
                                                "rgba(26,26,26,0.6)",
                                                "rgba(26,26,26,0)",
                                                "rgba(26,26,26,0)",
                                                "rgba(26,26,26,0.6)"
                                            ]}
                                        >
                                            <Center>
                                                <Info user={item.user} />
                                                <Sidebar
                                                    videoId={item.id}
                                                    avatarSrc={avatar}
                                                    count={item.count}
                                                    user={item.user}
                                                />
                                            </Center>
                                        </Gradient>
                                    </View>
                                )
                            })}
                        </ViewPagerContainer>
                        <Tabs></Tabs>
                    </Container>
                </>
            );
        } else
        {

            return (
                <View style={styles.container}>
                    <ActivityIndicator></ActivityIndicator>
                </View>
            );
        }

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

export default Home;

//sure no issue but open the file