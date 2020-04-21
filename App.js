import React from "react";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { Entypo } from "@expo/vector-icons";
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MessageScreen from "./screens/MessageScreen";
import PostScreen from "./screens/PostScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Home2Screen from "./screens/Home2Screen";
import UserScreen from "./screens/UserScreen";
import Chat from"./screens/Chat";
import NewChat from"./screens/NewChat";

import { AsyncStorage, Dimensions } from 'react-native';
import firebase from "firebase";
import { Title } from "react-native-paper";
import { View, Text, StyleSheet, Button, StatusBar, Image, TouchableOpacity,TouchableHighlight } from "react-native";

import { decode, encode } from 'base-64'
import { Row } from "native-base";
import VideoScreen from "./screens/VideoScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
global.crypto = require("@firebase/firestore");
global.crypto.getRandomValues = byteArray => { for (let i = 0; i < byteArray.length; i++) { byteArray[i] = Math.floor(256 * Math.random()); } }
if (!global.btoa) { global.btoa = encode; }

if (!global.atob) { global.atob = decode; }

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
        width: Dimensions.get('window').width - 20,
        backgroundColor: "white",
    },
    applogo: {
        height: 24,
        width: "100%",
        flex: 1,
        padding: 20,
        margin: 5,
    },
    title: {
        fontSize: 30,
        fontWeight: "600",
        color: "#EE1D52",
    },
    notification: {
        color: "#EE1D52",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.1,
    },
    tabBar: {
        backgroundColor: "#0a0003",
        borderBottomWidth: 0,
        borderTopWidth:0,
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
    }
});

function LogoTitle() {
    return (
        <>
            <View style={styles.container}>

                <Text style={styles.title}>Talent</Text>
                <Entypo style={styles.notification} name="notification" size={24} />
            </View>

        </>
    );
}

const ProfileContainer = createStackNavigator(
    {

        Profilo: {
            screen: ProfileScreen,
            navigationOptions: {
                headerStyle: {
                    backgroundColor: '#0a0003', borderBottomWidth: 0, shadowRadius: 0,
                    shadowOffset: {
                        height: 0,
                    },
                },

            }
        },
        Video: {
            screen: VideoScreen,
            navigationOptions: {
                headerTransparent: true,
                headerBackTitleVisible: false,
                headerTitle: ' ',
            }
        },
        Modifica: {
            screen: EditProfileScreen,
            navigationOptions: {
                headerStyle: {
                    backgroundColor: '#0a0003', borderBottomWidth: 0, shadowRadius: 0,
                    shadowOffset: {
                        height: 0,
                    },
                },

            }
        },
    },
    {

        defaultNavigationOptions: {
            headerShown: true,
            headerTintColor: "#EE1D52",
            shadowColor: 'transparent'
        }
    }

);

const talentStack = createBottomTabNavigator(
    {
        Home: {
            screen: Home2Screen,
            navigationOptions: {
                unmountOnBlur: true,
                tabBarIcon: ({ tintColor }) => <Entypo name="home" size={24} color={tintColor} />
            }

        },

        // Prova: {
        //     screen: Home2Screen,
        //     navigationOptions: {
        //         tabBarIcon: ({ tintColor }) => <Entypo name="home" size={24} color={tintColor} />
        //     }

        // },
        Message: {
            screen: MessageScreen,
            navigationOptions: {
                tabBarIcon: ({ tintColor }) => <Entypo name="chat" size={24} color={tintColor} />,
                
            }
        },
        Post: {
            screen: PostScreen,
            navigationOptions: {
                headerShown: true,
                tabBarLabel: ' ',
                tabBarIcon: ({ tintColor }) => (
                    <View style={{
                        backgroundColor: "#EE1D52",
                        height: 58,
                        width: 58,
                        borderRadius: 32,
                        shadowColor: "#bf0e37",
                        shadowOffset: { width: 0, height: 5 },
                        shadowRadius: 5,
                        shadowOpacity: 0.5,
                    }}>
                        <Entypo
                            name="clapperboard"
                            size={26}
                            color='#fff'
                            style={{
                                lineHeight: 58,
                                textAlign: "center",

                            }}
                        />
                    </View>

                )
            }
        },
        Search: {
            screen: SearchScreen,
            navigationOptions: {
                headerShown: false,
                tabBarIcon: ({ tintColor }) => <Entypo name="magnifying-glass" size={24} color={tintColor} />
            }
        },
        Profile: {
            screen: ProfileContainer,
            navigationOptions: {
                headerShown: false,
                tabBarIcon: ({ tintColor }) => <Entypo name="user" size={24} color={tintColor} />
            }
        }
    },
    {
        defaultNavigationOptions: {
            tabBarOnPress: ({ navigation, defaultHandler }) => {
                if (navigation.state.key === "Post") {
                    navigation.navigate("Carica");
                } else {
                    defaultHandler();
                }

            },
            headerShown: false,
        },
        tabBarOptions: {
            activeTintColor: "#bf0e37",
            inactiveTintColor: "#B3ABAF",
            style: styles.tabBar
        }
    }
);

const AppContainer = createStackNavigator(
    {

        Talent: talentStack,
        Carica: {
            screen: PostScreen
        },
        User: {
            screen: UserScreen
        },
        Chat: {
            screen: Chat
        },
        NewChat: {
            screen: NewChat
        }
    },
    {

        defaultNavigationOptions: {
            headerShown: false,
            headerTransparent: true,

            headerTintColor: '#fff',
        }
    }

);

const AuthStack = createStackNavigator({
    Login: LoginScreen,
    Register: RegisterScreen,
});

export default createAppContainer(
    createSwitchNavigator(
        {
            Loading: LoadingScreen,
            App: AppContainer,
            Auth: AuthStack
        },
        {
            initialRouteName: "Loading",
        }
    )
);

