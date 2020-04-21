import React from "react";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, ScrollView, Modal, SafeAreaView } from "react-native";
import { Text } from 'galio-framework';
import firebase from "firebase";
import LoginScreen from "./LoginScreen";
import { Video } from 'expo-av';
import Profile from '../component/Profile';
import Fire from "../Fire";
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-uuid'
import { AsyncStorage } from 'react-native';
import * as c from "../config";
import { withGlobalContext } from '../GlobalContext';

class UserScreen extends React.Component {

    //STATE
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.route.params?.user || {},
            isMine: this.props.route.params?.isMine ?? false,
        };
    }

    componentDidMount() {
        //console.log(this.props.route.params);
        console.log("started user screen");
        console.log(this.state.isMine);

        if(!this.state.isMine) {
            firebase.firestore().collection('videos')
            .where('owner', '==', this.state.user.id)
            .get().then((querySnapshot) => {
                var userVideos = [];
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    let video = doc.data();
                    video.id = doc.id;
                    userVideos.push(video);
                    //console.log(doc.id, " => ", doc.data());
                });
                this.setState({ userVideos })
            })
        }
        
        //this.signOut();
    }

    signOut = () => {
        firebase.auth().signOut();
        console.log("signout");
    };

    _pickImage = async () => {

        ImagePicker.launchImageLibraryAsync(c.avatarPicker)
            .then((result) => {
                if (result.cancelled) { return };

                const imgUri = result.uri;
                const updt_u = { ...this.state.user, avatar: imgUri };
                // imposta stato di aggiornamento dell'avatar
                this.setState({ refreshingAvatar: true });

                // aggiorno in memoria locale l'intero utente
                AsyncStorage.setItem("lastUser", JSON.stringify(updt_u));
                // aggiorno lo stato
                this.setState({
                    user: updt_u,
                    isImageAvailable: true
                });
                // aggiorno i dati sul server
                this.uploadImageAsync(imgUri)
            })
            .catch((err) => {
                console.log(err);
                this.setState({ refreshingAvatar: false });
            })

    };

    // questa funzione riceve l'uri di un'immagine e la salva su firestore
    // prima nello storage, e poi aggiorna l'utente con il nuovo riferimento
    uploadImageAsync = async (uri) => {

        const id = firebase.auth().currentUser.uid;
        // avatar avrà sempre lo stesso nome - ne salviamo uno per utente
        const id_avatar = `@avatar-${id}`;

        // Why are we using XMLHttpRequest? See:
        // https://github.com/expo/expo/issues/2402#issuecomment-443726662
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        // carica nello storage
        firebase.storage().ref().child(id_avatar).put(blob)
            .then((snapshot) => { blob.close(); return snapshot.ref.getDownloadURL() })
            // carica nel database
            .then((url) => {
                let u = this.state.user;
                // aggiorna avatar con il riferimento dello storage
                u.avatar = url;
                firebase.firestore().collection("users").doc(id).update(u);
            })
            .then(() => { this.setState({ refreshingAvatar: false }); }
            )
            .catch((error) => {
                console.log(error);
                this.setState({ refreshingAvatar: false });
                alert("Ops! Riprovaci...");
            })

    }

    follow = () => {
        if (!this.state.isMine && this.state.user.email) {
            const me = firebase.auth().currentUser.uid;
            const hisEmail = this.state.user.email;
            if (this.state.user.id) {
                firebase.firestore().collection("following").add({ follower: me, followed: this.state.user.id });
            } else {
                firebase.firestore().collection("users").where("email", "==", hisEmail)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            // doc.data() is never undefined for query doc snapshots
                            console.log(doc.id, " => ", doc.data());
                            firebase.firestore().collection("following").add({ follower: me, followed: doc.id });
                        });
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                    });
            }
        }
    }

    //RENDER
    render() {
        return (
            <SafeAreaView>
                {/* <Text h1 color="white">Is online: {this.props.global.user.name}</Text> */}
                {this.props.global.user ? (
                    <Profile
                        user={this.state.user}
                        userVideos={this.state.userVideos}
                        navigation={this.props.navigation}
                        update={this._pickImage}
                        signout={this.signOut}
                        guest={!this.state.isMine}
                        follow={this.follow}
                    />

                )
                    : <Text color="white"> No User</Text>
                }
            </SafeAreaView>
        );
    }
}
export default withGlobalContext(UserScreen);

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
        backgroundColor: "#ea1043",
        padding: 18,
        width: "50%",
        marginLeft: "15%"
    },
    chat: {
        backgroundColor: "transparent",
        borderColor: "#ea1043",
        borderWidth: 1,
        padding: 18,
        width: "18%",
        marginLeft: "5%"
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
    cover: {
        width: 300,
        height: 300
    }
});


