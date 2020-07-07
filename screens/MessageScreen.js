import React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, FlatList, TextInput } from 'react-native';
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { Right } from "native-base";
import { withGlobalContext } from "../GlobalContext";



class MessageScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            usersFound: {},
            isImageAvailable: false,
            visible: false,
            profilePic: null,
            dataSource: [],
            selectedVideo: null,
            searchString: "",
            query: "",
            search: "",
            fullChats: [],
        };
    }

    componentDidMount() {
        var that = this;
        let fullChats = this.props.global.chats;
        // const myId = firebase.auth().currentUser.uid;
        // fullChats.forEach((chat,i)=>{
        //     const myIndex = chat.between.indexOf(myId);
        //     // if i am 0, other is 1 and viceversa
        //     fullChats[i].otherIndex = +!myIndex; // cast index to boolean and then to number
        // })
        //console.log('fullchat',fullChats);
        this.setState({ fullChats });
        // var promises = [];

        // fullChats.forEach((chat) => {

        //     let userToFetch;

        //     if (chat.between[0] == this.props.global.user._id) {
        //         userToFetch = chat.between[1]
        //     }
        //     else { userToFetch = chat.between[0] }

        //     promises.push(this.fetchUser(userToFetch));
        // });

        // Promise.all(promises).then(results => {
        //     results.forEach((result,index) => {
        //         const res = result.data();
        //         fullChats[index].otherUser = {
        //             avatar:res.avatar,
        //             _id:res.id,
        //             name:res.name,
        //             surname:res.surname,
        //             username:res.username
        //         };
        //     })
        //     that.setState({ fullChats });
        //     //console.log(fullChats)
        //   })

    }

    async fetchUser(user) {
        return firebase.firestore().collection('users').doc(user).get();
    }

    updateSearch = search => {
        this.setState({ search });
    };

    getChat = () => {
        firebase.database().ref("chat/").where('id', 'array-contains-any',
            ['1', 'east_coast']);
    }


    render() {
        //console.log('fullchats', this.state.fullChats);
        const { search } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                <View style={{ justifyContent: "center" }}>
                    <TouchableOpacity ><Text style={styles.title}>Chat</Text>
                    </TouchableOpacity>
                    <Entypo name="circle-with-plus" size={24} color="white" style={styles.circle} onPress={() => {
                        this.props.navigation.navigate('NewChat')
                    }}></Entypo>
                </View>
                <View style={styles.searchSection}>
                    <Entypo name="magnifying-glass" size={24} color="white" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="User Nickname"
                        value={search}
                        onEndEditing={this.searchFromDb}
                        onChangeText={this.updateSearch}
                        underlineColorAndroid="transparent"
                        autoFocus={true}
                        placeholderTextColor="white"

                    />
                </View>
                <ScrollView style={{ width: "100%" }}>
                    <FlatList
                        data={this.state.fullChats}
                        renderItem={({ item }) => {

                            var i = item.otherIndex;
                            return (<TouchableOpacity style={styles.row} onPress={() => {
                                //console.log(item);
                                this.props.navigation.push('ChatWith', {
                                    chatId: item.id,
                                    recipient: item.users[i]
                                });
                            }}>
                                <Image
                                    source={
                                        item.avatars[i] ? { uri: item.avatars[i] } :
                                            require("../assets/tempAvatar.jpg")
                                    }
                                    style={styles.avatar}
                                />
                                <View style={styles.column}>
                                    <Text style={styles.name}>
                                        {item.users[i].name}
                                    </Text>
                                    <Text style={styles.message}>
                                        {item.users[i].surname}
                                    </Text>
                                </View>
                            </TouchableOpacity>)
                        }}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </ScrollView>
            </SafeAreaView>
        )
    }

}

export default withGlobalContext(MessageScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "#0f0104"
    },
    row: {
        height: 80,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    column: {
        flexDirection: "column"
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 68,
        marginLeft: 10
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 20,
        color: "#EE1D52"
    },
    message: {
        fontSize: 15,
        color: "gray",
        marginLeft: 20,
        marginTop: 5
    },
    searchSection: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#0f0104',
    },
    searchIcon: {
        padding: 10,
        marginLeft: 20,
        backgroundColor: '#1C1C1C',

    },
    circle: {
        padding: 10,
        marginRight: 20,
        alignSelf: "flex-end"
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        height: 47.5,
        backgroundColor: '#1C1C1C',
        color: 'white',
        marginRight: 10
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: 25,
        alignSelf: "center",
        padding: 10,
    }


})
