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
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import {Badge,withBadge } from 'react-native-elements'


class Profile extends React.Component {

    constructor(props) {
        super(props);
        //console.log(props);
        this.state = {
            followed: false,
            loadingIndicator: false,
            progress: 20,
            progressWithOnComplete: 0,
            progressCustomized: 0,
            status:""
        }
    }

    componentDidMount () {
        this.setState({followed: this.isFollowed()});
        this.checkStatus();

    }

    checkStatus = () =>{
        var showUser;
        if (this.props.guest) {
            showUser = this.props.user;
            showUser.user_videos = this.props.userVideos;
        } else {
            showUser = this.props.global.user;
        }

        const like = showUser?.like_count ?showUser.like_count : "0";
        var that = this;
        //DEFINE CATEGORY STATUS
        if (like <= 5000)
        {
            that.setState({status:"emergente"});
        }
        else 
         if(like>5000 && like<=10000)
            {
             that.setState({status:"talento"})
            }
        else 
         if(like>10000 && like<=15000)
            {
                that.setState({status:"star"})
            }
        else 
         if(like>15000)
            {
                that.setState({status:"superstar"})
            }
    }

    increase = (key, value) => {
        this.setState({
          [key]: this.state[key] + value,
        });
      }

    isFollowed = () => {
        const userShown = this.props?.user.id || null;
        const followedList = this.props.global.user?.followed?.id_users || [];
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
    handleNavigation = (chatObject) => {
        console.log('chAT OBJECT:', chatObject);
        this.props.navigation.push('ChatWith', {
            chatId: chatObject.id,
            recipient: chatObject.recipient
        });
    }

    estimateChatId(uid1, uid2) {
        if (uid1 < uid2) {
            return uid1 + uid2;
        }
        else {
            return uid2 + uid1;
        }
    }

    handleNewChat = (item) => {
        console.log('newchat, pressed on', item);
        var that = this;
        const idUtente = item.id;
        var gu = that.props.global.user;
        const idMio = gu._id;
        
        // se esiste ha questa chiave
        // const key = this.hash(idMio, idUtente);
        const chatId = this.estimateChatId(idMio, idUtente);
        const ref = firebase.firestore().collection('chats').doc(chatId);
        var arg = { id: chatId, recipient: item };

        ref.get().then(function (doc) {

            if (doc.exists) {
                console.log("Document id:", doc.id);

            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                const chatItem = {
                    avatars: [item.avatar, gu.avatar],
                    between: [idUtente, idMio],
                    users: [
                        {
                            name: item.name,
                            surname: item.surname,
                            username: item.username,
                            token: item.token
                        }, 
                        {
                            name: gu.name,
                            surname: gu.surname,
                            username: gu.username,
                            token: gu.token
                        }
                    ]
                };
                console.log('creating...',chatItem);
                return ref.set(chatItem)
            }
        }).then(() => { that.handleNavigation(arg); })
            .catch(err => { console.log(err) });
    }

    render() {
        const { height, width } = Dimensions.get('window');
        const barWidth = Dimensions.get('screen').width - 150;

        const progressCustomStyles = {
          backgroundColor: '#FEBB29', 
          borderRadius: 10,
          borderColor: '#FEBB29',
          height:20
        };

        var showUser;
        if (this.props.guest) {
            showUser = this.props.user;
            showUser.user_videos = this.props.userVideos;
        } else {
            showUser = this.props.global.user;
        }

        let StatusIcon;
        if (this.state.loadingIndicator) {
            StatusIcon = <ActivityIndicator size="small" color="#00ff00" />
        }

        return (
            <ScrollView contentContainerStyle={{ marginTop: 10, alignItems: "center", justifyContent: "space-around" }}>
                <View style={{borderWidth:1, borderColor:"#FFD21D",width:160,marginBottom:20}}>
        <Text style={{fontSize:25,color:"#FFD21D", fontWeight:"bold",letterSpacing:2,marginBottom:15, borderWidth:1, borrderColor:"#FFD21D",marginTop:10,textAlign:"center",}}>{this.state.status}</Text>

                </View>
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
                        <View style={{flexDirection:"row",marginTop:20,justifyContent:"center"}}>

                        <Image 
                                source={
                                    showUser.like_count>1000  ?
                                    
                                            require('../assets/bronze2.png') : 

                                            require('../assets/logo.png') ,

                                    showUser.like_count>2000  ?
                                    
                                            require('../assets/bronze2.png') : 

                                            require('../assets/logo.png')         
                                }
                                style={{height:50,width:50,}}
                                />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", padding: 5 }}>
                    {this.props.guest ? (
                        <>
                            <View style={{ margin: 10, flexDirection: "row", justifyContent: "center", alignItems: "center",}}>
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
                                    onPress={() => {this.handleNewChat(showUser)}} >
                                    <Icon name="message-text" size={24} color="#EA1043" />
                                    <Text style={{ color: "#C3C5CD", fontSize: 12, lineHeight: 24, margin: 5 }}>Messaggio</Text>
                                </TouchableOpacity>

                            </View>
                        </>
                    )
                        : (
                            <>
                                {/* <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
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

                                </View> */}
                            </>
                        )}

                </View>


                <View style={{ flexDirection: "row",marginBottom:10 }}>
                    <Text h4 color="white">{showUser?.name} </Text>
                    <Text h4 color="white">{showUser?.surname} </Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser?.user_videos ?showUser.user_videos.length : "0"}</Text>
                        <Text style={styles.statTitle}>Video</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser?.followers_count ?showUser.followers_count  : "0"}</Text>
                        <Text style={styles.statTitle}>Follower</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{showUser?.followed_count ?showUser.followed_count  : "0"}</Text>
                        <Text style={styles.statTitle}>Seguiti</Text>
                    </View>
                </View>

                 <FlatList contentContainerStyle={styles.MainContainer}
                    data={showUser?.user_videos}
                    renderItem={({ item }) => (

                            <TouchableOpacity style={styles.imageThumbnail} onPress={() => this.props.navigation.navigate('Video', {
                                video: item,
                                owner: showUser
                            })}>
                                <Image source={{ uri: item.thumbnail }} style={styles.imageThumbnail}></Image>
                            </TouchableOpacity>
                         )}
                            //Setting the number of column
                            numColumns={3}
                            keyExtractor={(item) => item.id}
                        />
                 </ScrollView>           
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
        marginBottom:20
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
        justifyContent: 'center',
        alignSelf:"center",
        width:Dimensions.get('screen').width - 10,
        top:50,
    },
    imageThumbnail: {
        height: Dimensions.get('window').width / 2,
        width: Dimensions.get('window').width/3
    },
    cover: {
        width: 300,
        height: 300
    }
});
