import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, RefreshControl, Modal, ImageBackground } from "react-native";
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
import { Entypo } from "@expo/vector-icons";
import userLikesVideo from "../services/Interactions";
import * as c from "../config";
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, Button, Block, Input, Card, Radio } from 'galio-framework'
import Profile from '../component/Profile';



export default class ProfileScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: { 
                followers: { id_users: [] }, 
                followed: { id_users: [] }, 
                avatar: null,
                user_videos:[] },
            refreshing: false,
            isImageAvailable: false,
            visible: false,
            dataSource: [],
            selectedVideo: null,
            newPassword: "",
            currentPassword: ""
        };
    }

    _showModal = () => this.setState({ visible: true });
    _hideModal = () => this.setState({ visible: false });

    getLastUser = async () => {
        // AsyncStorage.getItem("profilePic")
        //     .then((profilePic) => {
        //         if (profilePic) {
        //             this.setState({
        //                 user: { ...this.state.user, avatar: profilePic },
        //                 isImageAvailable: true,
        //             });

        //         }
        //     });

        AsyncStorage.getItem('lastUser').then((JSONuser) => {
            if (JSONuser) {
                const usr = JSON.parse(JSONuser);
                this.setState({ user: usr });
            }

        })

    }

    pressVideo(item) {
        this.setState({ ...this.state, selectedVideo: item });
        console.log(item);
        //console.log(this.state);
    }

    componentDidMount() {
        this.getLastUser();
        this._onRefresh();
    }

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


    getUserData() {
        let id = firebase.auth().currentUser.uid;

        firebase.firestore().collection('users').doc(id).get()
            .then(doc => {
                console.log(doc.id, doc.data());
                // snapshot.forEach(doc => {
                //     const data = doc.data();
                //     console.log(doc.id, data);
                // });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
        return true;
    }

    _onRefresh = () => {
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
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    reauthenticate = () => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, this.state.currentPassword);
        return user.reauthenticateWithCredential(cred);
    }

    changePassword = () => {
        this.reauthenticate(this.state.currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updatePassword(this.state.newPassword).then(() => {
                console.log("Password updated!");
            }).catch((error) => { console.log(error); });
        }).catch((error) => { console.log(error); });
    }

    updateData = () => {

        let id = firebase.auth().currentUser.uid;
        firebase.firestore().collection("users").doc(id)
            .update({
                name: this.state.user.name,
                surname: this.state.user.surname,
                email: this.state.user.email,
            })
            .catch((err) => {
                console.log(err);
                alert("Error: ", err);
            })
        this.changePassword();
        this.setState({ visible: false })
    }

    render() {
        const { height, width } = Dimensions.get('window');

        return (
            <SafeAreaView style={{ backgroundColor: "#0f0104" }}>
                
                <ScrollView
                    tintColor="white"
                    refreshControl={
                        <RefreshControl
                            tintColor="#EE1D52"
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <Profile user = {this.state.user} navigation = {this.props.navigation} update={this._pickImage}/>
                    {/* <View style={{ marginTop: 10, alignItems: "center", justifyContent: "space-around", height: Dimensions.get('screen').height / 2 - 35 }}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity activeOpacity={.5} onPress={this._pickImage}>
                                <Image
                                    source={
                                        this.state.user.avatar
                                            ? { uri: this.state.user.avatar }
                                            : require("../assets/tempAvatar.jpg")
                                    }
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "center", padding: 5 ,}}>
                            <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                    onPress={() => this.props.navigation.navigate('Modifica', {
                                        editingUser: this.state.user
                                    })} >
                                    <Icon2 name="settings" size={24} color="#EE1D52" />
                                    <Text style={{ color: "#C3C5CD", fontSize: 12, }}>Modifica profilo</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity style={{ margin: 5, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
                                    onPress={() => { Fire.signOut() }} >
                                    <Icon name="logout" size={24} color="#EA1043" />
                                    <Text style={{ color: "#C3C5CD", fontSize: 12, }}>Esci</Text>
                                </TouchableOpacity>

                            </View>

                        </View>


                        <View style={{ flexDirection: "row", }}>
                            <Text h4 color="white">{this.state.user?.name} </Text>
                            <Text h4 color="white">{this.state.user?.surname} </Text>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user?.user_videos ? this.state.user.user_videos.length : "0"}</Text>
                                <Text style={styles.statTitle}>Video</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followers?.id_users ? this.state.user.followers.id_users.length : "0"}</Text>
                                <Text style={styles.statTitle}>Follower</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followed?.id_users ? this.state.user.followed.id_users.length : "0"}</Text>
                                <Text style={styles.statTitle}>Seguiti</Text>
                            </View>
                        </View>
                    </View>

                    <FlatList
                        contentContainerStyle={{ marginTop: 20 }}
                        horizontal={false}
                        numColumns={3}
                        data={this.state.user?.user_videos}
                        renderItem={({ item }) => (

                            <View style={
                                {
                                    flex: 1 / 3,
                                    margin: 5,
                                    backgroundColor: '#fafafa',
                                    height: 200,
                                    borderRadius: 5,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 9.84,

                                    elevation: 5,

                                }
                            }>
                                <View style={{ height: "100%", width: "100%", flexDirection: "column", overflow: "hidden" }}>
                                    <TouchableOpacity style={{ flex: 8 }} onPress={() => this.props.navigation.navigate('Video', {
                                        video: item,
                                        owner: this.state.user
                                    })}>
                                        <Image source={{ uri: item.thumbnail }} style={{ flex: 1, borderRadius: 5 }}></Image>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", height: "100%" }}>
                                        <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.likes} </Text>
                                        <Entypo name="star-outlined" size={18} color={"#EE1D52"} />
                                    </View>
                                </View>



                            </View>
                        )}
                        //Setting the number of column
                        keyExtractor={(item) => item.id}
                    /> */}
                </ScrollView>
            </SafeAreaView >

        );
    }
}


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
        color: "#EE1D52",
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
