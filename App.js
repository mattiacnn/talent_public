import React from "react";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { Ionicons } from "@expo/vector-icons";
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MessageScreen from "./screens/MessageScreen";
import PostScreen from "./screens/PostScreen";
import NotificationScreen from "./screens/NotificationScreen";
import ProfileScreen from "./screens/ProfileScreen";
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
        flex:1,
        flexDirection:"row",
        justifyContent:"flex-start",
        backgroundColor: '#ECF0F1',
    },
    applogo:{
        height:48,
        width:48,
        padding:5,
        position:"relative",
        left: 0,
    },
    title:{
        fontSize:20
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
                        tabBarIcon: ({ tintColor }) => <Ionicons name="ios-home" size={24} color={tintColor} />
                    }
                    
                },
                Message: {
                    screen: MessageScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => <Ionicons name="ios-chatboxes" size={24} color={tintColor} />
                    }
                },
                Post: {
                    screen: PostScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => (
                            <Ionicons
                                name="ios-add-circle"
                                size={64}
                                color="#E9446A"
                                style={{
                                    shadowColor: "#E9446A",
                                    shadowOffset: { width: 0, height: 5 },
                                    shadowRadius: 5,
                                    shadowOpacity: 0.3,
                                    position: "absolute",

                                }}
                            />
                        )
                    }
                },
                Notification: {
                    screen: NotificationScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => <Ionicons name="ios-notifications" size={24} color={tintColor} />
                    }
                },
                Profile: {
                    screen: ProfileScreen,
                    navigationOptions: {
                        tabBarIcon: ({ tintColor }) => <Ionicons name="ios-person" size={24} color={tintColor} />
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
        Carica: {
            screen: PostScreen
        },
    },
    {
        mode: "modal",
        
        defaultNavigationOptions: { headerTitle: props => <LogoTitle {...props} /> }
    }
      
);

const AuthStack = createStackNavigator({
    Login: LoginScreen,
    Register: RegisterScreen
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

