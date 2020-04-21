import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView, RefreshControl, Modal, ImageBackground, TouchableHighlight } from "react-native";
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'



export default class EditProfileScreen extends React.Component {

    static navigationOptions = ({route}) => {
        return {
            title: 'Modifica',
            headerRight: () => (
                <TouchableOpacity onPress={()=>{route.params.save()}}>
                    <Text color="white" bold style={{marginHorizontal:10}}>Salva</Text>
                </TouchableOpacity>
              ),
        };
    };

    constructor(props) {
        super(props);
        // QUESTO FUNZIONA
        const { editingUser } = this.props.route.params;
        this.state = {
            user: editingUser,
            refreshing: false,
            newPassword: "",
            currentPassword: ""
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({ save: this.save }); //initialize your function
    }

    reauthenticate = () => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, this.state.currentPassword);
        return user.reauthenticateWithCredential(cred);
    }

    changePassword = () => {
        console.log("changing password");
        this.reauthenticate(this.state.currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updatePassword(this.state.newPassword).then(() => {
                console.log("Password updated!");
            }).catch((error) => { console.log(error); });
        }).catch((error) => { console.log(error); });
    }

    save = () => {
        console.log("saved");
        console.log(this.state.user);
        const id = firebase.auth().currentUser.uid;
        firebase.firestore().collection('users').doc(id).update(this.state.user)
        .then((value) =>{alert('Salvato!')});
        if(this.state.currentPassword && this.state.newPassword) {
            this.changePassword();
        }
        
    }

    render() {
        var s = require('../style');

        return (
            <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height,  }}>
                <KeyboardAwareScrollView
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    contentContainerStyle={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, }}
                    scrollEnabled={true}
                >
                    <View >
                        <SafeAreaView >
                            <View style={{ marginHorizontal: 30, marginTop: 20 }}>
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontSize: 12, color: "#ea1043", }}>Nome</Text>
                                    <Input
                                        rounded
                                        color="white"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        placeholder={this.state.user.name}
                                        onChangeText={name => this.setState({ user: { ...this.state.user, name } })}
                                    />
                                </View>

                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontSize: 12, color: "#ea1043", }}>Cognome</Text>
                                    <Input
                                        rounded
                                        color="white"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        placeholder={this.state.user.surname}
                                        onChangeText={surname => this.setState({ user: { ...this.state.user, surname } })}
                                    />
                                </View>


                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontSize: 12, color: "#ea1043", }}>Username</Text>
                                    <Input
                                        rounded
                                        color="white"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        placeholder={this.state.user.username}
                                        onChangeText={username => this.setState({ user: { ...this.state.user, username } })}
                                    />
                                </View>

                                <View style={{ marginBottom: 10 }}>
                                    <Text style={{ fontSize: 12, color: "#ea1043", }}>Email</Text>
                                    <Input
                                        rounded
                                        color="white"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        placeholder={this.state.user.email}
                                        onChangeText={email => this.setState({ user: { ...this.state.user, email } })}
                                    />
                                </View>

                                <View>
                                    <Text style={{ fontSize: 12, color: "#ea1043", marginTop: 10 }}>Sicurezza</Text>
                                    <Input placeholder="password attuale" password viewPass

                                        color="white" iconColor="#ea1043"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        onChangeText={currentPassword => this.setState({ currentPassword })}
                                    />
                                    <Input placeholder="nuova password" password viewPass

                                        color="white" iconColor="#ea1043"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                        onChangeText={newPassword => this.setState({ newPassword })}
                                    />
                                    <Input placeholder="ripeti la nuova password" password viewPass

                                        color="white" iconColor="#ea1043"
                                        style={{ backgroundColor: "transparent", fontSize: 18, borderColor: "#ea1043" }}
                                        placeholderTextColor="white"
                                    />
                                </View>



                            </View>
                        </SafeAreaView>
                    </View>
                </KeyboardAwareScrollView>
            </View>

        )
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
