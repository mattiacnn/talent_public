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
import GlobalFeed from "./screens/GlobalFeed";
import UserScreen from "./screens/UserScreen";
import Chat from "./screens/Chat";
import firebase from "firebase";
import { Title } from "react-native-paper";
import { View, Text, StyleSheet, Button, StatusBar, Image, TouchableOpacity } from "react-native";

import { decode, encode } from 'base-64'
import { Row } from "native-base";
global.crypto = require("@firebase/firestore");
global.crypto.getRandomValues = byteArray => { for (let i = 0; i < byteArray.length; i++) { byteArray[i] = Math.floor(256 * Math.random()); } }

if (!global.btoa) { global.btoa = encode; }

if (!global.atob) { global.atob = decode; }

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#ea1043",
    },
    applogo: {
        height:24,
        width:"100%",
        flex: 1,
        padding:20,
        margin:5,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        shadowOpacity: 0.5,
    },
    title: {
        flex: 4,
        fontSize: 30,
        fontWeight: "600",
        color: "white",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.2,
        textAlign:"left"
    },
    notification: {
        flex: 1,
        color:"white",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.2,
        textAlign:"center"
    }
});

function LogoTitle() {
    return (
        <>
            <View style={styles.container}>
                <Image
                    style={styles.applogo}
                    source={require('./assets/logo.png')}
                />
                <Text style={styles.title}>Talent</Text>
                <Entypo style={styles.notification} name="notification" size={24} />
            </View>

        </>
    );
}

const AppContainer = createStackNavigator(
    {

        Talent: createBottomTabNavigator(

            {
                Home: {
                    screen: HomeScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => <Entypo name="home" size={24} color={tintColor} />
                    }

                },
                Message: {
                    screen: MessageScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => <Entypo name="chat" size={24} color={tintColor} />
                    }
                },
                Post: {
                    screen: PostScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => (
                            <Entypo
                                name="clapperboard"
                                size={32}
                                color="#ea1043"
                                style={{
                                    shadowColor: "#bf0e37",
                                    shadowOffset: { width: 0, height: 5 },
                                    shadowRadius: 5,
                                    shadowOpacity: 0.3,
                                    position: "absolute",

                                }}
                            />
                        )
                    }
                },
                Global: {
                    screen: GlobalFeed,
                    navigationOptions: {
                        headerShown: false,
                        tabBarIcon: ({ tintColor }) => <Entypo name="magnifying-glass" size={24} color={tintColor} />
                    }
                },

                Profile: {
                    screen: ProfileScreen,
                    navigationOptions: {
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
                    }
                },
                tabBarOptions: {
                    activeTintColor: "#161F3D",
                    inactiveTintColor: "#B8BBC4",
                    showLabel: false
                }
                
            }
        ),
        Search: {
            screen:SearchScreen
        },
        User: {
            screen:UserScreen
        },
        Chat: {
            screen: Chat
        },
        Carica: {
            screen: PostScreen
        },
    },
    {

        defaultNavigationOptions: { headerTitle: props => <LogoTitle {...props} />, headerStyle: {
            backgroundColor: '#ea1043',
          },}
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
            initialRouteName: "Loading"
        }
    )
);

