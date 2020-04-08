import React from "react";
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, SafeAreaView, RefreshControl, Modal } from "react-native";
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
export default class ProfileScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: { followers: { id_users: [] }, followed: { id_users: [] } },
            refreshing: false,
            isImageAvailable: false,
            profilePic: null,
            visible: false,
            dataSource: [],
            selectedVideo: null

        };
    }

    _showModal = () => this.setState({ visible: true });
    _hideModal = () => this.setState({ visible: false });

    getImage = async () => {
        const profilePic = await AsyncStorage.getItem("profilePic");
        if (profilePic) {
            this.setState({
                ...this.state,
                isImageAvailable: true,
                profilePic: JSON.parse(profilePic)
            });

        }
    }

    pressVideo(item) {
        this.setState({ ...this.state, selectedVideo: item });
        console.log(item);
        //console.log(this.state);
    }

    componentDidMount() {
        this.getImage();
        this._onRefresh();
    }

    _pickImage = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        console.log(result);

        if (!result.cancelled) {
            const source = { uri: result.uri };
            AsyncStorage.setItem("profilePic", JSON.stringify(source));
            this.setState({
                ...this.state,
                profilePic: source,
                isImageAvailable: true
            });

            this.uploadImageAsync(result.uri).then((uri) => {
                const updt_u = { ...this.state.user, avatar: uri };

                this.setState({
                    ...this.state,
                    user: updt_u
                });

                console.log(this.state.user);
            })
        }

    };


    uploadImageAsync = async (uri) => {
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

        const id_avatar = uuid();

        const ref = firebase
            .storage()
            .ref()
            .child(id_avatar);
        const snapshot = await ref.put(blob);

        // We're done with the blob, close and release it
        blob.close();

        const id = firebase.auth().currentUser.uid;
        try {
            let u = this.state.user;
            u.avatar = id_avatar;
            firebase.firestore().collection("users").doc(id)
                .set(u);
        } catch (error) {
            console.log(error);
            alert("Ops! Riprovaci...");
        }

        const source = { uri: uri };

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        AsyncStorage.setItem("profilePic", JSON.stringify(source));
        this.setState({
            ...this.state,
            profilePic: source,
            isImageAvailable: true
        });

        return await snapshot.ref.getDownloadURL();
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
        this.setState({ visible: false })
    }

    like = async (video_id)  => {
        const uid = Fire.uid();
        userLikesVideo(uid,video_id);
    }

    render() {

        const videoSelezionato = this.state.selectedVideo;
        let modale;

        if (videoSelezionato) {
            modale = (
                <Modal>
                    <View style={styles.container}>
                        <SafeAreaView>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => this.setState({ ...this.state, selectedVideo: {} })} >
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
            );
        } else {
            modale = (
                <View></View>
            );
        }

        return (
            <SafeAreaView>
                <Modal visible={this.state.selectedVideo != null}
                transition="fade">
                    <View style={{justifyContent:"flex-start", flexDirection:"column", alignItems:"stretch"}}>
                        <SafeAreaView>
                            <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", marginHorizontal:10}}>
                                <TouchableOpacity onPress={() => this.setState({ ...this.state, selectedVideo: null })} >
                                    <Text style={{ color: "black", fontSize: 18 }}>Indietro</Text>
                                </TouchableOpacity>
                                <Text style={{ fontWeight: "600", alignSelf: "center", fontSize: 17 }}>Visualizza video</Text>
                            </View>
                            <View style={{display:"flex", justifyContent:"center",alignItems:"space-between"}}>
                                
                                <View>
                                    <Video
                                    source={{ uri: this.state.selectedVideo?.uri }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode="cover"
                                    shouldPlay={true}
                                    isLooping={false}
                                    useNativeControls={true}
                                    style={{ height:300,width:180}}
                                    />
                                </View>
                                <View>
                                    <Text>{this.state.selectedVideo?.description}</Text>
                                    <TouchableOpacity onPress={() => this.like(this.state.selectedVideo.id)} >
                                    <Entypo name="star-outlined" size={32} color={"black"} />
                                </TouchableOpacity>
                                </View>
                                
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <View style={styles.container}>
                        <View style={{ marginTop: 34, alignItems: "center" }}>
                            <View style={styles.avatarContainer}>
                                <TouchableOpacity activeOpacity={.5} onPress={this._pickImage}>
                                    <Image
                                        source={
                                            this.state.isImageAvailable
                                                ? this.state.profilePic
                                                : require("../assets/tempAvatar.jpg")
                                        }
                                        style={styles.avatar}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: "row", }}>
                                <Text style={styles.name}>{this.state.user.name} </Text>
                                <Text style={styles.name}>{this.state.user.surname}</Text>
                            </View>
                        </View>
                        <View style={styles.statsContainer}>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.user_videos ? this.state.user.user_videos.length : "0"}</Text>
                                <Text style={styles.statTitle}>Posts</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followers?.id_users ? this.state.user.followers.id_users.length : "0"}</Text>
                                <Text style={styles.statTitle}>Followers</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followed?.id_users ? this.state.user.followed.id_users.length : "0"}</Text>
                                <Text style={styles.statTitle}>Following</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={this._showModal}>
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                                <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 12, marginTop: -3 }}>Modifica Profilo</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.MainContainer}>
                        <FlatList
                            data={this.state.user.user_videos}
                            renderItem={({ item }) => (

                                <View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                    <TouchableOpacity onPress={() => this.pressVideo(item)} >
                                        <Image style={styles.imageThumbnail} source={{ uri: item.thumbnail }} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            //Setting the number of column
                            numColumns={2}
                            keyExtractor={(item) => item.id}
                        />
                    </View>


                    <Modal visible={this.state.visible}>

                        <View style={styles.container}>
                            <SafeAreaView>

                                <View style={styles.header}>
                                    <TouchableOpacity onPress={() => this.setState({ visible: false })} >
                                        <Text style={{ color: "black", fontSize: 18 }}>Annulla</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontWeight: "600", alignSelf: "center", fontSize: 17, marginTop: -2 }}>Modifica il profilo</Text>
                                    <TouchableOpacity>
                                        <Text style={{ color: "#369AFB", fontSize: 18, fontWeight: "500", }} onPress={() => this.updateData()}>Fine</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 34, alignItems: "center" }}>
                                    <View style={styles.avatarContainer}>
                                        <Image
                                            source={
                                                this.state.isImageAvailable
                                                    ? this.state.profilePic
                                                    : require("../assets/tempAvatar.jpg")
                                            }
                                            style={styles.avatar}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formContainer}>
                                    <View style={styles.column}>
                                        <Text style={styles.label}>Nome</Text>
                                        <Text style={styles.label}>Cognome</Text>
                                        <Text style={styles.label}>Email</Text>
                                        <Text style={styles.label}>Password</Text>
                                    </View>

                                    <View style={styles.column2}>
                                        <TextInput placeholder={this.state.user.name} style={styles.input} onChangeText={name => this.setState({ user: { ...this.state.user, name } })}></TextInput>
                                        <TextInput placeholder={this.state.user.surname} style={styles.input} onChangeText={surname => this.setState({ user: { ...this.state.user, surname } })}></TextInput>
                                        <TextInput placeholder={this.state.user.email} style={styles.input} onChangeText={email => this.setState({ user: { ...this.state.user, email } })}></TextInput>
                                        <TextInput style={{ height: 20, marginBottom: 10 }}></TextInput>
                                    </View>

                                </View>
                                <TouchableOpacity onPress={() => { Fire.shared.signOut(); }} style={styles.logout}>
                                    <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                                        <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 15, marginTop: -3 }}>ESCI</Text>
                                    </View>
                                </TouchableOpacity>
                            </SafeAreaView>
                        </View>
                    </Modal>
                </ScrollView>
            </SafeAreaView >

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
    formContainer: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderBottomColor: "#E4E4E4",
        borderTopColor: "#E4E4E4",
        flexDirection: "row",
        height: 300,
        paddingTop: 20,
        paddingBottom: 10,
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
        margin: 10
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#E4E4E4",
        margin: 10,
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
        justifyContent: "space-between",
        margin: 32
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
    modalLogout: {
        backgroundColor: "#FF5166",
        padding: 18,
        width: "50%",
        alignSelf: "center",
        alignSelf: "center",
        justifyContent: "center",
        marginTop: 300
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
});
