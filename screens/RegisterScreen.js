import React from "react";
import { View, Text, Modal, StyleSheet, StatusBar, TextInput, TouchableOpacity, Image, AsyncStorage, SafeAreaView, ImageBackground } from "react-native";

import Fire from "../Fire";
import { CheckBox } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';

import *as firebase from "firebase";
import * as Facebook from 'expo-facebook';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

export default class RegisterScreen extends React.Component {
    static navigationOptions = {
        headerShown: false
    };

    constructor(props) {
        super(props);
        this.state = {
            user: {
                name: "",
                surname: "",
                username: "",
                email: "",
                password: "",
                birthdate: "",
                avatar: null,
                followed: { id_users: [] },
                followers: { id_users: [] },
            },
            visible: false,
            errorMessage: null,
            checked: false,
            maxDate: new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
            minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
            date: new Date(),
            mode: 'date',
            show: false,
            message: "Seleziona Data di nascita"
        };
    }

    registerForPushNotificationsAsync = async () => {
        var token;
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = await Notifications.getExpoPushTokenAsync();
            console.log(token);
            if (Platform.OS === 'android') {
                Notifications.createChannelAndroidAsync('default', {
                    name: 'default',
                    sound: true,
                    priority: 'max',
                    vibrate: [0, 250, 250, 250],
                });
            };
        }
        else {
            alert('Must use physical device for Push Notifications');
        }
        return token;

    };

    // CREATE NEW USER AND STORE IT ON FIRESTORE
    handleSignUp = async () => {
        console.log(this.state.user);
        var newUser = this.state.user;
        var uid = '';
        // registra utente
        this.registerForPushNotificationsAsync()
            .then((token) => {
                newUser.token = token;
                return Fire.createUser(newUser)
            })
            .then((res) => {
                uid = res.user.uid;
                delete newUser.password;
                return firebase.firestore().collection("users").doc(uid).set(newUser)
            })
            .then(async () => {
                // se c'è avatar lo salviamo nello storage
                if (newUser.avatar) {
                    const uri = newUser.avatar;
                    // avatar avrà sempre lo stesso nome - ne salviamo uno per utente
                    const id_avatar = `@avatar-${uid}`;
                    // Why are we using XMLHttpRequest? See:
                    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
                    var blob = await new Promise((resolve, reject) => {
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
                        // aggiorna il database
                        .then((url) => {
                            let u = newUser;
                            // aggiorna avatar con il riferimento dello storage
                            u.avatar = url;
                            // aggiongo user al database
                            firebase.firestore().collection("users").doc(uid).update(u);
                        });
                }

            })
            //.then(() => { AsyncStorage.setItem("lastUser", JSON.stringify(newUser)) })
            // TO-DO: non prosegue da qui, naviga direttamente nell'altra pagina
            .then(() => alert("Registrazione avvenuta con successo!"))
            //.then(() => this.checkIfLoggedIn())
            .catch((error) => {
                console.log(error);
                alert("Ops! Riprovaci...");
            });

    }

    // REDIRECT THE USER TO THE HOMESCREEN IF IS LOGGED
    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                this.props.navigation.navigate('Home');
            }
        }.bind(this)
        );
    };

    handlePickAvatar = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        console.log(result);

        if (!result.cancelled) {
            const source = result.uri;
            AsyncStorage.setItem("profilePic", source);
            this.setState({ user: { ...this.state.user, avatar: source } });
        }

    };

    condition = () => {
        if (this.state.checked == false) {
            this.setState({ checked: true })
        }
        else {
            this.setState({ checked: false })

        }
    }

    render() {
        var s = require('../style');
        const onChange = (event, selectedDate) => {
            const currentDate = selectedDate || date;
            const userUpdate = { ...this.state.user, birthdate: selectedDate };
            this.setState({ user: userUpdate, show: false, birthdate: currentDate, message: currentDate.toLocaleDateString() });
        };

        return (
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={s.container}
                scrollEnabled={true}
            >
                <StatusBar barStyle='light-content'></StatusBar>
                <Image
                    source={require('../assets/authHeader.png')}
                    style={{ marginTop: -116, marginLeft: -50 }}
                ></Image>
                <Image
                    source={require('../assets/authFooter.png')}
                    style={{ position: 'absolute', bottom: -325, right: -225 }}
                ></Image>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.navigate('Login')}
                >
                    <Ionicons
                        name='ios-arrow-round-back'
                        size={42}
                        color='#FFF'
                    ></Ionicons>
                </TouchableOpacity>
                <View
                    style={{
                        position: 'absolute',
                        top: 64,
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <Text style={styles.greeting}>
                        {'Registrati ora.\n Mostra a tutti il tuo talento!'}
                    </Text>
                    <TouchableOpacity
                        style={styles.avatarPlaceholder}
                        onPress={this.handlePickAvatar}
                    >
                        <Image
                            source={this.state.user?.avatar ? { uri: this.state.user.avatar } : null}
                            style={styles.avatar}
                        />
                        <Ionicons
                            name='ios-add'
                            size={40}
                            color='#fff'
                            style={{ marginTop: 6, marginLeft: 2 }}
                        ></Ionicons>
                    </TouchableOpacity>
                </View>

                <View style={styles.errorMessage}>
                    {this.state.errorMessage && (
                        <Text style={styles.error}>{this.state.errorMessage}</Text>
                    )}
                </View>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.inputTitle}>Nome</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={name =>
                                this.setState({ user: { ...this.state.user, name } })
                            }
                            value={this.state.user.name}
                            placeholder={"Inserisci il tuo nome"}
                        ></TextInput>
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.inputTitle}>Email</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            onChangeText={email =>
                                this.setState({ user: { ...this.state.user, email } })
                            }
                            value={this.state.user.email}
                            placeholder={"Inserisci il tuo indirizzo email"}
                        ></TextInput>
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.inputTitle}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            autoCapitalize='none'
                            onChangeText={password =>
                                this.setState({ user: { ...this.state.user, password } })
                            }
                            value={this.state.user.password}
                            placeholder={"Password di almeno 6 caratteri"}
                        ></TextInput>
                    </View>

                    <TouchableOpacity style={!this.state.user.email || !this.state.user.password ? styles.disabled : styles.button}
                        disabled={!this.state.user.email || !this.state.user.password ? true : false}
                        onPress={() => this.setState({ visible: true })}>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                            <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 15, marginTop: -3 }}>Avanti</Text>
                        </View>
                    </TouchableOpacity>
                </View>


                <Modal
                    animationType="fade"
                    visible={this.state.visible}
                >
                    <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.container}
                        scrollEnabled={true}>
                        <StatusBar barStyle='light-content'></StatusBar>
                        <Image
                            source={require('../assets/authHeader.png')}
                            style={{ position: 'absolute', marginTop: -146, marginLeft: -50 }}
                        ></Image>
                        <Image
                            source={require('../assets/authFooter.png')}
                            style={{ position: 'absolute', bottom: -325, right: -225 }}
                        ></Image>
                        <TouchableOpacity
                            style={styles.back}
                            onPress={() => this.setState({ ...this.state, visible: false })}
                        >
                            <Ionicons
                                name='ios-arrow-round-back'
                                size={42}
                                color='#FFF'
                            ></Ionicons>
                        </TouchableOpacity>


                        <View style={styles.errorMessage}>
                            {this.state.errorMessage && (
                                <Text style={styles.error}>{this.state.errorMessage}</Text>
                            )}
                        </View>
                        <Image
                            source={require('../assets/logo.png')}
                            style={{ height: 150, width: 150, alignSelf: "center", marginTop: 80, position: "absolute" }}
                        />
                        <View style={{ ...styles.form, marginTop: 160, alignItems: "stretch", alignContent: "center", flexDirection: "column", }}>

                            <View >
                                <Text style={styles.inputTitle}>Username</Text>
                                <TextInput placeholder="username" style={styles.input} onChangeText={username => this.setState({ user: { ...this.state.user, username } })}></TextInput>
                            </View>

                            <View>
                                <TouchableOpacity onPress={() => this.setState({ show: !this.state.show })} >
                                    <Text style={styles.inputData}>{this.state.message}</Text>
                                </TouchableOpacity>
                                {this.state.show && (<DateTimePicker
                                    testID="dateTimePicker"
                                    timeZoneOffsetInMinutes={0}
                                    value={this.state.date}
                                    mode={'date'}
                                    is24Hour={true}
                                    display="calendar"
                                    onChange={onChange}
                                    minimumDate={this.state.minDate}
                                    maximumDate={this.state.maxDate}
                                />)}
                            </View>

                            <View >
                                <CheckBox
                                    title='Accetto i temini e le condizioni di talent'
                                    checked={this.state.checked}
                                    onPress={() => this.condition()}
                                    checkedColor="red"
                                />
                            </View>

                            <TouchableOpacity
                                style={!this.state.user.username || !this.state.user.birthdate || !this.state.checked ? styles.disabled : styles.button}
                                disabled={!this.state.user.username || !this.state.user.birthdate || !this.state.checked ? true : false}
                                onPress={this.handleSignUp} >
                                <View style={{ display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "space-around", }}>
                                    <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, alignSelf: "center", fontSize: 15, marginTop: -3 }}>Registrati</Text>
                                </View>
                            </TouchableOpacity>
                            <Text style={{ alignSelf: "center", marginTop: 30 }}>Condizioni e termini di servizio di talent</Text>
                        </View>


                    </KeyboardAwareScrollView>
                </Modal>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    greeting: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        color: '#FFF'
    },
    form: {
        marginTop: -10,
        marginBottom: 10,
        marginHorizontal: 40,
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-around",
    },
    inputTitle: {
        color: '#8a8f9e',
        fontSize: 10,
        textTransform: 'uppercase'
    },
    inputData: {
        textAlign: "center",
        lineHeight: 32,
        color: '#fff',
        fontSize: 16,
        textTransform: 'uppercase',
        backgroundColor: '#E9446a',
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        borderBottomColor: '#8a8f9e',
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: '#8a8f9e'
    },
    errorMessage: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    button: {
        backgroundColor: '#E9446a',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        color: '#e9446a',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    },
    back: {
        position: 'absolute',
        zIndex: 9999,
        top: 48,
        left: 32,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(21, 22, 48, 0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#cccccc',
        borderRadius: 50,
        marginTop: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        position: 'absolute',
        zIndex: 2,
        width: 100,
        height: 100,
        borderRadius: 50
    },
    disabled: {
        backgroundColor: '#b9b9b9b0',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
