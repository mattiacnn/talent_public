import React, { useState } from "react";
// Navigation
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon2 from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import MessageScreen from "./screens/MessageScreen";
import PostScreen from "./screens/PostScreen";
import SearchScreen from "./screens/SearchScreen";
import Home2Screen from "./screens/Home2Screen";
import UserScreen from "./screens/UserScreen";
import Chat from"./screens/Chat";
import NewChat from"./screens/NewChat";
import VideoScreen from "./screens/VideoScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import StartSfida from "./screens/StartSfida";
// Utilities
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Entypo } from "@expo/vector-icons";
import { AsyncStorage, Dimensions } from 'react-native';
import { View, Text, StyleSheet, Button, StatusBar, Image, TouchableOpacity, TouchableHighlight } from "react-native";
import Fire from './Fire';
import firebase from 'firebase';
import 'firebase/firestore';
import {GlobalContextProvider} from './GlobalContext';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
// Cose strane
import { decode, encode } from 'base-64'
import { Row } from "native-base";
global.crypto = require("@firebase/firestore");
global.crypto.getRandomValues = byteArray => { for (let i = 0; i < byteArray.length; i++) { byteArray[i] = Math.floor(256 * Math.random()); } }
if (!global.btoa) { global.btoa = encode; }
if (!global.atob) { global.atob = decode; }

// disabilita a un certo punto
console.disableYellowBox = true;

// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
import ChatFlavio from "./screens/ChatFlavio";
import NewMessageScreen from "./screens/NewMessageScreen";
import SfideScreen from "./screens/SfideScreen";
enableScreens();

const MyTheme = {
    dark: true,
    colors: {
        primary: '#979797',
        background: '#0f0104',
        card: '#0a0003',
        text: 'white',
        border: 'transparent',
    },
};

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
        borderTopWidth: 0,
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

function PostIcon() {
    return (
        <View style={{
            backgroundColor: "transparent",
            height: 58,
            width: 58,
            borderRadius: 32,
            shadowColor: "transparent",
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 5,
            shadowOpacity: 0.5,
        }}>
        <Image
                style={{height:70, width:70}}
                source={require('./assets/FaviconLogo.png')}
            />        
      </View>
    )
}




const AuthStack = createStackNavigator();
function AuthStackComponent() {

    return (
        <AuthStack.Navigator initialRouteName="Login" headerMode="none">
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Registrati" component={RegisterScreen} />
        </AuthStack.Navigator>
    )

}

const MySelfStack = createStackNavigator();
function MySelfStackComponent({ route }) {
    const { isMine } = route.params;
    return (
        <MySelfStack.Navigator>
            <MySelfStack.Screen name="Utente" component={UserScreen} options={{ title: isMine ? '' : 'Utente' }} initialParams={{ isMine }} />
            <MySelfStack.Screen name="Video" component={VideoScreen} />
        </MySelfStack.Navigator>
    )
}

const UserVideoStack = createStackNavigator();
function UVStackComponent({ route }) {
    const { isMine } = route.params;
    return (
        <UserVideoStack.Navigator mode="modal" headerMode="none">
            <UserVideoStack.Screen name="Utente" component={UserScreen} options={{ headerShown: false }} initialParams={{ isMine }} />
            <UserVideoStack.Screen name="Video" component={VideoScreen} />
        </UserVideoStack.Navigator>
    )
}

const HomeStack = createStackNavigator();
function HomeStackComponent({ route }) {
    const { nome } = route.params;
    console.log(`this is ${nome}`);
    return (
        <HomeStack.Navigator initialRouteName="Timeline" >
            <HomeStack.Screen name="Timeline" component={Home2Screen} initialParams={{ nome: nome }}  options={{ headerShown: false }}/>
            <HomeStack.Screen name="Esplora" component={UVStackComponent} />
            <HomeStack.Screen name="StartSfida" component={StartSfida}  options={{ headerShown: false }} />
        </HomeStack.Navigator>
    )
}

const ChatStack = createStackNavigator();
function ChatStackComponent() {
    return (
        <ChatStack.Navigator initialRouteName="Chat">
            <ChatStack.Screen name="Chat" component={MessageScreen} options={{headerShown:false}}/>
            <ChatStack.Screen name="ChatWith" component={ChatFlavio} options={{headerTitle:"Conversazione"}}/>
            <ChatStack.Screen name="NewChat" component={NewMessageScreen} options={{headerShown:true}}/>
            <ChatStack.Screen name="Esplora" component={UVStackComponent} />
        </ChatStack.Navigator>
    )
}

const SearchStack = createStackNavigator();
function SearchStackComponent() {
    return (
        <SearchStack.Navigator initialRouteName="Cerca">
            <SearchStack.Screen name="Cerca" component={SearchScreen} options={{headerShown:false}}/>
            <SearchStack.Screen name="Esplora" component={UVStackComponent} />
            <SearchStack.Screen name="Categoria" component={SearchScreen} />
            <SearchStack.Screen name="Video" component={VideoScreen} />

            <SearchStack.Screen name="ChatWith" component={ChatFlavio} options={{}}/>
        </SearchStack.Navigator>
    )
}

const ProfileStack = createStackNavigator();
function ProfileStackComponent({ route }) {
    const { isMine } = route.params;
    return (
        <ProfileStack.Navigator initialRouteName="Il tuo Profilo">
            <ProfileStack.Screen name="Modifica" component={EditProfileScreen} options={EditProfileScreen.navigationOptions} />
            <ProfileStack.Screen name="Il tuo Profilo" component={MySelfStackComponent} initialParams={{ isMine }} options={{ headerShown: false }} />
            <ProfileStack.Screen name="Sfide" component={SfideScreen}/>
        </ProfileStack.Navigator>
    )
}


const HomeTabs = createBottomTabNavigator();
function HomeTabsComponent({ route, nav }) {
    const { myname } = route.params;

    return (
        <HomeTabs.Navigator
            initialRouteName="Home" tabBarOptions={{
                inactiveTintColor: '#ffff',
              }}>
            <HomeTabs.Screen name="Home" component={HomeStackComponent} initialParams={{ nome: myname }} options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
            }} />
            <HomeTabs.Screen name="Chat" component={ChatStackComponent} options={{
                tabBarLabel: 'Chat',
                tabBarIcon: ({ color, size }) => (
                    <Icon2 name="chat-bubble" size={size} color={color} />
                ),
            }} />
            <HomeTabs.Screen name="Post" component={PostScreen} listeners={({ navigation, route }) => ({
                tabPress: e => {
                    // Prevent default action
                    e.preventDefault();
                    // Do something with the `navigation` object
                    navigation.navigate('Carica');
                },
            })
            }
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size }) => (
                        <PostIcon />
                    ),
                }} />
            <HomeTabs.Screen name="Cerca" component={SearchStackComponent} options={{
                tabBarLabel: 'Cerca',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="account-search" color={color} size={size} />
                ),
            }} />
            <HomeTabs.Screen name="Profilo" component={ProfileStackComponent} initialParams={{ isMine: true }}
                options={{
                    tabBarLabel: 'Profilo',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="face-profile" color={color} size={size} />
                    ),
                }} />
        </HomeTabs.Navigator>
    )
}

const RootStack = createStackNavigator();

export default function App() {
    //checkIfLoggedIn();

    var [isLogged, setIsLogged] = useState(0);
    var [nome, setNome] = useState('flavio');

    firebase.auth().onAuthStateChanged(user => {
        console.log("changed");
        if (user) {
            console.log("utente ok");
            setIsLogged(true);
        } else {
            console.log("No user");
            setIsLogged(false);
        }

    });

    return (
        <GlobalContextProvider>
            <NavigationContainer theme={MyTheme}>
                <RootStack.Navigator
                    initialRouteName="Talent"
                    mode="modal"
                    headerMode="none"
                >
                    {isLogged ? (
                        <>
                            <RootStack.Screen name="Talent" component={HomeTabsComponent} initialParams={{ myname: nome }} />
                            <RootStack.Screen name="Carica" component={PostScreen} />
                        </>
                    ) : (
                            <RootStack.Screen name="Accesso" component={AuthStackComponent} />
                        )}
                </RootStack.Navigator>
            </NavigationContainer>
        </GlobalContextProvider>);
}