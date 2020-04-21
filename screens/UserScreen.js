import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image, FlatList,Dimensions,ScrollView,Modal,SafeAreaView } from "react-native";
import firebase from "firebase";
import LoginScreen from "./LoginScreen";
import { Video } from 'expo-av';

export default class UserScreen extends React.Component {

    //STATE
    constructor(props) {
        super(props);
        this.state = {
          userFound: {user_video:[], followers:[]},
          selectedVideo: null,
          visible:false,
        };
      }

    //ON RENDER  
    componentDidMount(){
        this.setState({userFound: this.props.navigation.getParam('user').user})
    }

    //SHOW THE VIDEO
    pressVideo(item) {
        this.setState({ ...this.state, selectedVideo: item });
        console.log(item);
        this.setState({visible:true})
        //console.log(this.state);
    }

    follow = () =>{
        var user = [firebase.auth().currentUser.uid]
         firebase.firestore().collection("users").doc(this.props.navigation.getParam('user').id)
            .update({
                    followers: user
                });
    }
    //RENDER
    render() {
        return (
            <View style={styles.container}>

                <View style={{ marginTop: 34, alignItems: "center" }}>

                    <View style={styles.avatarContainer}>
                        <TouchableOpacity activeOpacity={.5} onPress={this._pickImage}>
                            <Image
                                source={
                                   this.state.userFound.avatar
                                        ? this.state.userFound.avatar
                                        : require("../assets/tempAvatar.jpg")
                                }
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", }}>
                        <Text style={styles.name}>{this.state.userFound.name} </Text>
                        <Text style={styles.name}>{this.state.userFound.surname}</Text>
                    </View>

                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{this.state.userFound.user_videos ? this.state.userFound.user_videos.length : "0"}</Text>
                        <Text style={styles.statTitle}>Posts</Text>
                    </View>

                <View style={styles.stat}>
                    <Text style={styles.statAmount}>{this.state.userFound.followers? this.state.userFound.followers.length : "0"}</Text>
                    <Text style={styles.statTitle}>Followers</Text>
                </View>

                <View style={styles.stat}>
                    <Text style={styles.statAmount}>{this.state.userFound.followed? this.state.userFound.followed.id_users.length : "0"}</Text>
                    <Text style={styles.statTitle}>Following</Text>
                </View>

            </View>

            <View style={{width:"100%", flexDirection:"row", alignItems:"center"}}>
                <TouchableOpacity style={styles.button} onPress={this.follow}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                        <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 12, marginTop: -3 }}>Segui</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.chat} onPress={() => {
                                this.props.navigation.navigate('Chat', {
                                    user: this.state.userFound,
                                    id:this.props.navigation.getParam('user').id
                                })
                            }}>
                                <Text style={{ color: "#EE1D52", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 12, marginTop: -3 }}>Chat</Text>
                </TouchableOpacity>
            </View>                    

            <ScrollView style={{width:"100%",paddingTop: 30,}}>
                     <FlatList
                            data={this.state.userFound.user_videos}
                            renderItem={({ item }) => (

                                <View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                    <TouchableOpacity onPress={() => this.pressVideo(item)} >
                                        <Image style={styles.imageThumbnail} source={{ uri: item.thumbnail }} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            //Setting the number of column
                            numColumns={2}
                            keyExtractor={(item) => item.uri}
                        />
            </ScrollView>
            <Modal visible = {this.state.visible}>
                    <View style={styles.container}>
                        <SafeAreaView>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => this.setState({ ...this.state, selectedVideo: {} } )} >
                                    <Text style={{ color: "black", fontSize: 18 }}>Indietro</Text>
                                </TouchableOpacity>
                                <Text style={{ fontWeight: "600", alignSelf: "center", fontSize: 17, marginTop: -2 }}>Visualizza video</Text>
                            </View>
                            <View style={{ marginTop: 34, alignItems: "center" }}>
                                <Video
                                    source={{ uri: this.state.selectedVideo?.uri }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode="cover"
                                    shouldPlay
                                    isLooping
                                    style={{ width: 300, height: 300 }}
                                />
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>
            </View>
        );
    }
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent:"center",
        alignItems:"center"
    },
    logout: {
        backgroundColor: "#FF5166",
        padding: 18,
        width: "50%",
        alignSelf: "center",
        marginTop: 50
    },
    formContainer:{
        borderBottomWidth:1,
        borderTopWidth:1,
        borderBottomColor:"#E4E4E4",
        borderTopColor:"#E4E4E4",
        flexDirection:"row",
        height:370,
        paddingTop:20,
        paddingBottom:20,
        marginTop:30
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
    label:{
        fontWeight:"300",
        fontSize:16,
        margin:15,
    },
    input:{
        borderBottomWidth:1,
        borderBottomColor:"#E4E4E4",
        margin:15,
        fontSize:17,
        padding:3

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
        flexDirection: "row",
        justifyContent: "space-around",
        margin: 32,
    },
    stat: {
        alignItems: "center",
        flex: 1
    },
    statAmount: {
        color: "#4F566D",
        fontSize: 18,
        fontWeight: "300"
    },
    modal: {
        backgroundColor: "red",
        opacity: 1.0
    },
    button: {
        backgroundColor: "#EE1D52",
        padding: 18,
        width: "50%",
        marginLeft:"15%"
    },
    chat:{
        backgroundColor: "transparent",
        borderColor:"#EE1D52",
        borderWidth:1,
        padding: 18,
        width: "18%",
        marginLeft:"5%"
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
        color: "#C3C5CD",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    },
    MainContainer: {
        justifyContent: 'center',
        flex: 1,
        paddingTop: 30,
    },
    imageThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,

    },
    cover:{
        width:300,
        height:300
    }
});


