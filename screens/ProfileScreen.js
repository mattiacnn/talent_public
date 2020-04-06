import React from "react";
import { View, Text, StyleSheet, Button, Image, TouchableOpacity, SafeAreaView, RefreshControl } from "react-native";
import Fire from "../Fire";
import firebase from 'firebase';
import 'firebase/firestore';
import { ScrollView, FlatList } from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-uuid'
import { AsyncStorage } from 'react-native';

export default class ProfileScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            refreshing: false,
            isImageAvailable: false,
            profilePic: null,
            dataSource:[]
        };
    }

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

    componentDidMount() {
        this.getImage();
        this._onRefresh();

        var that = this;
        let items = Array.apply(null, Array(60)).map((v, i) => {
            return { id: i, src: 'http://placehold.it/200x200?text=' + (i + 1) };
        });
        that.setState({
            dataSource: items,
        });
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

        // firebase.firestore().collection("users").doc(id).get()
        //     .then(doc => {
        //         if (!doc.exists) {
        //             console.log('No such document!');
        //         } else {
        //             console.log('Document data:', doc.data());
        //             this.setState({ user: { name: doc.data().name, surname: doc.data().surname, followed: doc.data().followed } })
        //             //var followedNum = doc.data().followed.length;
        //         }
        //     })
        //     .catch(err => {
        //         console.log('Error getting document', err);
        //     });
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
                    user: doc.data()
                });

            })
            .then(() => {
                firebase.firestore().collection('videos').doc(id)
                    .collection("user_videos").get()
                    .then(docs => {
                        let uv = [];
                        docs.forEach(video => {
                            const data = video.data();
                            const id = video.id;
                            uv.push({ video: data, id: id });
                        })
                        const updt_u = { ...this.state.user, user_videos: uv };

                        this.setState({
                            ...this.state,
                            user: updt_u,
                            refreshing: false
                        });

                        console.log(this.state.user);
                    })
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });

        // this.getUserData()
        //     .then(() => {
        //         this.setState({ refreshing: false });
        //     }).catch(err => {
        //         console.log('Error getting document', err);
        //     });
    }

    render() {

        return (
            <SafeAreaView>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <View style={styles.container}>
                        <View style={{ marginTop: 64, alignItems: "center" }}>
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
                                <Text style={styles.statAmount}>{this.state.user.user_videos ? this.state.user.user_videos.length : "--"}</Text>
                                <Text style={styles.statTitle}>Posts</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followers ? this.state.user.followers.id_users.length : "--"}</Text>
                                <Text style={styles.statTitle}>Followers</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statAmount}>{this.state.user.followed ? this.state.user.followed.id_users.length : "--"}</Text>
                                <Text style={styles.statTitle}>Following</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={() => this.loginUser(this.state.email, this.state.password)}>
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                                <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 12, marginTop: -3 }}>Modifica Profilo</Text>
                            </View>
                        </TouchableOpacity>
                        <Button
                            onPress={() => {
                                Fire.shared.signOut();
                            }}
                            title="Log out"
                        />
                    </View>
                    <View style={styles.MainContainer}>
                        <FlatList
                            data={this.state.dataSource}
                            renderItem={({ item }) => (
                                <View style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                    <Image style={styles.imageThumbnail} source={{ uri: item.src }} />
                                </View>
                            )}
                            //Setting the number of column
                            numColumns={3}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView >

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
        width: 136,
        height: 136,
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
    button: {
        backgroundColor: "#FF5166",
        padding: 18,
        width: "40%",
        alignSelf: "center"
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
        height: 100,
    },
});
