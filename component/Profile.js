import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, RefreshControl, ActivityIndicator, ImageBackground } from "react-native";
import Fire from "../Fire";
import firebase from 'firebase';
import 'firebase/firestore';
import { ScrollView, FlatList, TextInput } from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-uuid'
import { AsyncStorage, Dimensions } from 'react-native';
import { YellowBox } from 'react-native';
import { Video } from 'expo-av';
import VideoPlayer from 'expo-video-player';
YellowBox.ignoreWarnings(['VirtualizedLists should never be nested']);
import VideoModal from "@paraboly/react-native-video-modal";
import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import userLikesVideo from "../services/Interactions";
import * as c from "../config";
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, Button, Block, Input, Card, Radio } from 'galio-framework'
import { withGlobalContext } from '../GlobalContext';

class Profile extends React.Component {

    constructor(props) {
        super(props);
        //console.log(props);
        this.state = {
            followed: false,
            loadingIndicator: false,
        }
    }

    componentDidMount () {
        this.setState({followed: this.isFollowed()})
    }

    prova() {
        console.log("prova");
    }

    isFollowed = () => {
        const userShown = this.props?.user.id || null;
        const followedList = this.props.global.user.followed.id_users || [];
        if (userShown) {
            return (followedList.includes(userShown));
        } else { return false }
    }

    followHandler = () => {
        this.props.follow();
        this.setState({loadingIndicator: true});
        setTimeout(() => {
            this.setState({followed: !this.state.followed, loadingIndicator: false});
        }, 500);
    }

    render() {
        const { height, width } = Dimensions.get('window');
        var showUser;
        if (this.props.guest) {
            showUser = this.props.user;
        } else {
            showUser = this.props.global.user;
        }

        let StatusIcon;
        if (this.state.loadingIndicator) {
            StatusIcon = <ActivityIndicator size="small" color="#00ff00" />
        }

        return (
            <View style={{ marginTop: 10, alignItems: "center", justifyContent: "space-around", }}>
                <View style={styles.avatarContainer}>
                    <TouchableOpacity activeOpacity={this.props.guest ? 1 : 0.5} onPress={this.props.guest ? (() => { }) : this.props.update}>
                        <Image
                            source={
                                showUser.avatar
                                    ? { uri: showUser.avatar }
                                    : require("../assets/tempAvatar.jpg")
                            }
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", padding: 5 }}>
                    {this.props.guest ? (
                        <>
                            <View style={{ margin: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                    onPress={this.followHandler} >
                                            <ActivityIndicator size="small" animating={this.state.loadingIndicator} />
                                    {this.state.followed ?
                                        (<><SimpleLineIcons name="user-unfollow" size={24} color="#EA1043" />
                                            
                                            <Text style={{ color: "#C3C5CD", fontSize: 12, lineHeight: 24, margin: 5 }}>Seguito</Text></>)
                                        :

                                        (<><SimpleLineIcons name="user-follow" size={24} color="#EA1043" />
                                            <Text style={{ color: "#C3C5CD", fontSize: 12, lineHeight: 24, margin: 5 }}>Segui</Text></>)
                                    }
                                </TouchableOpacity>

                            </View>

                            <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                    onPress={() => {
                                        this.props.navigation.navigate('Chat', {
                                            user: showUser,
                                        })
                                    }} >
                                    <Icon name="message-text" size={24} color="#EA1043" />
                                    <Text style={{ color: "#C3C5CD", fontSize: 12, lineHeight: 24, margin: 5 }}>Messaggio</Text>
                                </TouchableOpacity>

                            </View>
                        </>
                    )
                        : (
                            <>
                                <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                        onPress={() => this.props.navigation.navigate('Modifica', {
                                            editingUser: showUser,
                                        })} >
                                        <Icon2 name="settings" size={24} color="#EA1043" />
                                        <Text style={{ color: "#C3C5CD", fontSize: 12, }}>Modifica profilo</Text>
                                    </TouchableOpacity>

                                </View>

                                <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                        onPress={() => { this.props.signout() }} >
                                        <Icon name="logout" size={24} color="#EA1043" />
                                        <Text style={{ color: "#C3C5CD", fontSize: 12, }}>Esci</Text>
                                    </TouchableOpacity>

                                </View>
                            </>
                        )}

                </View>


                <View style={{ flexDirection: "row", }}>
                    <Text h4 color="white">{showUser?.name} </Text>
                    <Text h4 color="white">{showUser?.surname} </Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser?.user_videos ?showUser.user_videos.length : "0"}</Text>
                        <Text style={styles.statTitle}>Video</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser.followers?.id_users ? showUser.followers.id_users.length : "0"}</Text>
                        <Text style={styles.statTitle}>Follower</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser.followed?.id_users ?showUser.followed.id_users.length : "0"}</Text>
                        <Text style={styles.statTitle}>Seguiti</Text>
                    </View>
                </View>

                <FlatList
                    contentContainerStyle={{ marginTop: 20 }}
                    horizontal={false}
                    numColumns={3}
                    data={showUser?.user_videos}
                    renderItem={({ item }) => (

                        <View style={{ width: 100, height: 100, margin: 5, }}>
                            <TouchableOpacity style={{ flex: 8 }} onPress={() => this.props.navigation.navigate('Video', {
                                video: item,
                                owner: showUser
                            })}>
                                <Image source={{ uri: item.thumbnail }} style={{ flex: 1, borderRadius: 5 }}></Image>
                            </TouchableOpacity>
                        </View>

                        // <View style={
                        //     {
                        //         flex: 1 / 3,
                        //         margin: 5,
                        //         backgroundColor: '#fafafa',
                        //         height: 200,
                        //         borderRadius: 5,
                        //         shadowColor: "#000",
                        //         shadowOffset: {
                        //             width: 0,
                        //             height: 2,
                        //         },
                        //         shadowOpacity: 0.25,
                        //         shadowRadius: 9.84,

                        //         elevation: 5,

                        //     }
                        // }>
                        //     <View style={{ height: "100%", width: "100%", flexDirection: "column", overflow: "hidden" }}>
                        //         <TouchableOpacity style={{ flex: 8 }} onPress={() => this.props.navigation.navigate('Video', {
                        //             video: item,
                        //             owner: this.props.user
                        //         })}>
                        //             <Image source={{ uri: item.thumbnail }} style={{ flex: 1, borderRadius: 5 }}></Image>
                        //         </TouchableOpacity>
                        //         <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", height: "100%" }}>
                        //             <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.likes} </Text>
                        //             <Entypo name="star-outlined" size={18} color={"#ea1043"} />
                        //         </View>
                        //     </View>



                        // </View>
                    )}
                    //Setting the number of column
                    keyExtractor={(item) => item.id}
                />
            </View>
        );
    }
}
export default withGlobalContext(Profile);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: "center",
        alignItems: "center"
    },
    logout: {
        backgroundColor: "#FF5166",
        padding: 18,
        width: "50%",
        alignSelf: "center",
        marginTop: 50
    },
    formContainer: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderBottomColor: "#E4E4E4",
        borderTopColor: "#E4E4E4",
        flexDirection: "row",
        height: 370,
        paddingTop: 20,
        paddingBottom: 20,
        marginTop: 30
    },
    column: {
        flexDirection: "column",
        width: "30%",
        justifyContent: "space-between",
        marginLeft: "5%"
    },
    column2: {
        flexDirection: "column",
        width: "65%",
        justifyContent: "space-between"
    },
    label: {
        fontWeight: "300",
        fontSize: 16,
        margin: 15,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#E4E4E4",
        margin: 15,
        fontSize: 17,
        padding: 3

    },
    profile: {
        marginTop: 64,
        alignItems: "center"
    },
    avatarContainer: {
        shadowColor: "#151734",
        shadowRadius: 30,
        shadowOpacity: 0.4
    },
    avatar: {
        width: 106,
        height: 106,
        borderRadius: 68
    },
    name: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: "600"
    },
    statsContainer: {
        width: 250,
        flexDirection: "row",
        justifyContent: "center",
    },
    stat: {
        alignItems: "center",
        flex: 1
    },
    statAmount: {
        color: "#EA1043",
        fontSize: 18,
        fontWeight: "300"
    },
    modal: {
        backgroundColor: "red",
        opacity: 1.0
    },
    button: {
        backgroundColor: "#ea1043",
        padding: 18,
        width: "50%",
        alignSelf: "center"
    },
    header: {
        flexDirection: "row",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9DB",
        justifyContent: "space-between"
    },
    statTitle: {
        color: "#E4E4E4",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    },
    MainContainer: {
    },
    imageThumbnail: {
        height: 200,
    },
    cover: {
        width: 300,
        height: 300
    }
});
