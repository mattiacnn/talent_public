import React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, FlatList, TextInput } from 'react-native';
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { Right } from "native-base";
import { withGlobalContext } from "../GlobalContext";
import { reset } from "expo/build/AR";

const chats = [
    {
        id: 1, username: "Mattiacnn", text: "ciao come stai?", chatId: "1"
    },
    {
        id: 2, username: "Flaviocnn", text: "ciao come stai?"
    },
    {
        id: 3, username: "Carlo23", text: "ciao come stai?"
    },
    {
        id: 4, username: "Melo86", text: "ciao come stai?"
    },
    {
        id: 5, username: "GiuliaSpa", text: "ciao come stai?"
    },
    {
        id: 6, username: "GabryTeletabies", text: "ciao come stai?"
    },

]

class NewMessageScreen extends React.Component {

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
            fullChats: []
        };
    }

    async componentDidMount() {
        var that = this;
        const myId = firebase.auth().currentUser.uid;

        // this.fetchFollowedAndUser(myId)
        // this.setState((prevState, props) => {
        // return {data: [new obj].concat(prevState.data) };
        // })

        var followedList = await this.fetchUsersFollowed(myId);
        var fullList = [];
        var promises = [];

        followedList.forEach((followed) => {
            //console.log(followed.data().followed);return
            promises.push(this.fetchUser(followed.data().followed));
        });

        // Promise.resolve(item).then((item2) =>)

        Promise.all(promises).then(results => {
            results.forEach((result) => {
                const res = result.data();
                fullList.push({
                    avatar: res.avatar,
                    _id: result.id,
                    name: res.name,
                    surname: res.surname,
                    username: res.username,
                    token: res.token
                });
            })
            that.setState({ fullList });
            console.log(fullList)
        })

    }

    async fetchFollowedAndUser(user) {
        this.fetchUserFollowed(user).then(idUser => this.fetchUser(idUser.data()));
    }

    async fetchUsersFollowed(user) {
        return firebase.firestore().collection('following').where('follower', '==', user).get();
    }

    async fetchUser(user) {
        return firebase.firestore().collection('users').doc(user).get();
    }

    stringToNum = function (s) {
        var res = "";
        for (i = 0; i < s.length; i++) {
            res = res + s.charCodeAt(i);
        }
    }

    hash = function (params) {
        var h = 0, i = 0;
        if (typeof (params) === "string") {
            for (i = 0; i < params.length; i++) {
                h = (h * 31 + params.charCodeAt(i)) & 0xffffffff;
            }
        }
        else if (params instanceof Array) {
            for (i in params) {
                h ^= this.hash(params[i]);
            }
        }
        return Math.abs(h).toString();
    };

    async chatExist(userId) {
        let me = firebase.auth().currentUser.uid;
        const key = this.hash(me, userId);
        console.log(key);

        await firebase.firestore().collection('chats').where('between', "==", key)
            .get().then(function (doc) {
                if (doc.exists) {
                    console.log("Document data:", doc.data());
                    return doc.data();
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                    firebase.firestore().collection('chats')
                        .add({ between: key }).then(function (docRef) {
                            console.log("Document written with ID: ", docRef.id);
                            return docRef.id;
                        })
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
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
        const idUtente = item._id;
        const idMio = firebase.auth().currentUser.uid;
        var gu = that.props.global.user;
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

        const { search } = this.state;

        return (
            <SafeAreaView style={styles.container}>

                <ScrollView style={{ width: "100%" }}>
                    <FlatList
                        data={this.state.fullList}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.row} onPress={() => {
                                //console.log(item);
                                this.handleNewChat(item)
                            }}>
                                <Image
                                    source={
                                        item.avatar ? { uri: item.avatar } :
                                            require("../assets/tempAvatar.jpg")
                                    }
                                    style={styles.avatar}
                                />
                                <View style={styles.column}>
                                    <Text style={styles.name}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.message}>
                                        {item.surname}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item._id.toString()}
                    />
                </ScrollView>
            </SafeAreaView>
        )
    }

}

export default withGlobalContext(NewMessageScreen);

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
        height: 48,
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
