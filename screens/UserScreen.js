import React from "react";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, 
    Image, FlatList, Dimensions, ScrollView, SafeAreaView,Button } from "react-native";
import { Text } from 'galio-framework';
import firebase from "firebase";
import LoginScreen from "./LoginScreen";
import { Video } from 'expo-av';
import Profile from '../components/Profile';
import Fire from "../Fire";
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-uuid'
import { AsyncStorage } from 'react-native';
import * as c from "../config";
import { withGlobalContext } from '../GlobalContext';
import { FontAwesome } from '@expo/vector-icons';
import Modal, { ModalContent, ModalTitle } from 'react-native-modals';
import { Entypo } from "@expo/vector-icons";

class ListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View>
                <TouchableOpacity onPress={() => this.props.action()}>
                    <View style={styles.listContainer}>
                        <Entypo name={this.props.icon} color='#fff' size={33} />
                        <Text style={styles.text}>{this.props.title}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator}></View>
            </View>
    
        );
    }
}

class UserScreen extends React.Component {

    constructor(props) {
        super(props);

        this.props.navigation.setOptions({
            title:"",
            headerStyle:{display:"flex",alignSelf: 'flex-start', flexDirection:"row", textAlign:"left"},
            headerTitleStyle:{fontWeight: '500', fontSize:24, alignSelf: 'flex-start'},
            headerLeft: () => {return (<Text style={{color:"white",fontWeight: '800', fontSize:28, paddingLeft:20}}>Profilo</Text>)},
            headerRight: () => this.triggerBottomModal()
        });

        this.state = {
            user: this.props.route.params?.user || {},
            isMine: this.props.route.params?.isMine ?? false,
            showOptions: false,
            itemList: [
                {
                    icon: 'edit',
                    title: 'Modifica informazioni',
                    action: this.editProfile
                },
                {
                    icon: 'flash',
                    title: 'Le tue sfide',
                    action: this.handleSfida
                },
                {
                    icon: 'log-out',
                    title: 'Esci',
                    action: this.signOut
                },
            ],
        };
    }

     
    
    editProfile = () => {
        this.setState({showOptions:false});
            this.props.navigation.navigate("Modifica", {
                editingUser: this.props.global.user,
            })
    }

    triggerBottomModal = () => {
        return (
            <TouchableOpacity style={{marginRight:20}} onPress={()=> this.setState({showOptions: true})}>
                <Entypo name="dots-three-horizontal" size={28} color="white"></Entypo>
            </TouchableOpacity>
        )
        
    }

    componentDidMount() {
        
        //console.log(this.props.route.params);
        console.log("started user screen");

        // è il mio profilo o quello di un altro utente?
        console.log(this.state.isMine);

        // profilo guest
        if (!this.state.isMine)
        {
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
                });

            firebase.firestore().collection('counters').doc(this.state.user.id)
                .get().then(doc => {
                    const counters = doc.data();
                    this.setState({
                        user: {
                            ...this.state.user,
                            like_count: counters.like_count,
                            followed_count: counters.followed_count,
                            followers_count: counters.followers_count
                        }
                    });

                }, err => { console.log(err); }
                );
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
        const id_avatar = `@avatar-${ id }`;

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
        if (!this.state.isMine && this.state.user.email)
        {
            const me = firebase.auth().currentUser.uid;
            const hisEmail = this.state.user.email;
            if (this.state.user.id)
            {
                firebase.firestore().collection("following")
                    .add({ follower: me, followed: this.state.user.id });
            } else
            {
                firebase.firestore().collection("users").where("email", "==", hisEmail)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            // doc.data() is never undefined for query doc snapshots
                            console.log(doc.id, " => ", doc.data());
                            firebase.firestore().collection("following")
                                .add({ follower: me, followed: doc.id });
                        });
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                    });
            }
        }
    }

    handleSfida = () => {
        this.setState({showOptions:false});
        if (this.state.isMine)
        {
            // vai a visualizza sfide
            this.props.navigation.navigate('Sfide')
        } else
        {
            // posta video sfida
            this.props.navigation.push('Carica',
                { sfida: true, utenteSfidato: this.state.user })
        }
    }

    RenderItems = () => {
        var nav = this.props.navigation;
        return (
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.itemList}
                    renderItem={({ item }) => (
                        <ListItem icon={item.icon} title={item.title} navigation={nav} action={item.action}/>
                    )}
                />
        );
    }

    //RENDER
    render() {
        return (
            <SafeAreaView>
                {/* <Text h1 color="white">Is online: {this.props.global.user.name}</Text> */}
                {this.props.global.user ? (
                    <> 

                        <Profile
                            user={this.state.user}
                            userVideos={this.state.userVideos}
                            navigation={this.props.navigation}
                            update={this._pickImage}
                            signout={this.signOut}
                            guest={!this.state.isMine}
                            follow={this.follow}
                        />

                        <Modal.BottomModal
                            visible={this.state.showOptions}
                            onTouchOutside={() => this.setState({ showOptions: false })}
                            height={0.8}
                            width={1}
                            onSwipeOut={() => this.setState({ showOptions: false })}
                            modalTitle={
                                <ModalTitle
                                    title="Opzioni"
                                    hasTitleBar={false}
                                    style={{backgroundColor: '#2b2b2b', }}
                                    textStyle={{color: "#EE1D52"}}
                                />
                            }
                        >
                            <ModalContent
                                style={{
                                    flex: 1,
                                    backgroundColor: '#2b2b2b',
                                }}
                            >
                                {this.RenderItems()}
                                <Modal>
                                    
                                </Modal>
                            </ModalContent>
                        </Modal.BottomModal>
                    </>

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
    notification: {
        color: "#EE1D52",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.1,
        paddingRight: 10
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
        backgroundColor: "#EE1D52",
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
    },
    listContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 10
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginLeft:20,
    },
    separator: {
        height: 1.5,
        flex: 1,
        marginTop: 10,
        backgroundColor: '#6D6D6D'
    }
});


