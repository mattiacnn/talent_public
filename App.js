import React, { useState } from "react";
// Navigation
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
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
import VideoScreen from "./screens/VideoScreen";
import EditProfileScreen from "./screens/EditProfileScreen";

// Utilities
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Entypo } from "@expo/vector-icons";
import { AsyncStorage, Dimensions } from 'react-native';
import { View, Text, StyleSheet, Button, StatusBar, Image, TouchableOpacity, TouchableHighlight } from "react-native";
import Fire from './Fire';
import firebase from 'firebase';
import {GlobalContextProvider} from './GlobalContext';
// Cose strane
import { decode, encode } from 'base-64'
import { Row } from "native-base";
global.crypto = require("@firebase/firestore");
global.crypto.getRandomValues = byteArray => { for (let i = 0; i < byteArray.length; i++) { byteArray[i] = Math.floor(256 * Math.random()); } }
if (!global.btoa) { global.btoa = encode; }
if (!global.atob) { global.atob = decode; }

// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
import ChatFlavio from "./screens/ChatFlavio";
import NewMessageScreen from "./screens/NewMessageScreen";
enableScreens();

const MyTheme = {
    dark: true,
    colors: {
        primary: '#EA1043',
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
            backgroundColor: "#EA1043",
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
// const ProfileContainer = createStackNavigator(
//     {

//         Profilo: {
//             screen: ProfileScreen,
//             navigationOptions: {
//                 headerStyle: {
//                     backgroundColor: '#0a0003', borderBottomWidth: 0, shadowRadius: 0,
//                     shadowOffset: {
//                         height: 0,
//                     },
//                 },

//             }
//         },
//         Video: {
//             screen: VideoScreen,
//             navigationOptions: {
//                 headerTransparent: true,
//                 headerBackTitleVisible: false,
//                 headerTitle: ' ',
//             }
//         },
//         Modifica: {
//             screen: EditProfileScreen,
//             navigationOptions: {
//                 headerStyle: {
//                     backgroundColor: '#0a0003', borderBottomWidth: 0, shadowRadius: 0,
//                     shadowOffset: {
//                         height: 0,
//                     },
//                 },

//             }
//         },
//     },
//     {

//         defaultNavigationOptions: {
//             headerShown: true,
//             headerTintColor: "#EA1043",
//             shadowColor: 'transparent'
//         }
//     }

// );

// const talentStack = createBottomTabNavigator(
//     {
//         Home: {
//             screen: Home2Screen,
//             navigationOptions: {
//                 unmountOnBlur: true,
//                 tabBarIcon: ({ tintColor }) => <Entypo name="home" size={24} color={tintColor} />
//             }

//         },

//         // Prova: {
//         //     screen: Home2Screen,
//         //     navigationOptions: {
//         //         tabBarIcon: ({ tintColor }) => <Entypo name="home" size={24} color={tintColor} />
//         //     }

//         // },
//         Message: {
//             screen: MessageScreen,
//             navigationOptions: {
//                 tabBarIcon: ({ tintColor }) => <Entypo name="chat" size={24} color={tintColor} />
//             }
//         },
//         Post: {
//             screen: PostScreen,
//             navigationOptions: {
//                 headerShown: true,
//                 tabBarLabel: ' ',
//                 tabBarIcon: ({ tintColor }) => (
//                     <View style={{
//                         backgroundColor: "#EA1043",
//                         height: 58,
//                         width: 58,
//                         borderRadius: 32,
//                         shadowColor: "#bf0e37",
//                         shadowOffset: { width: 0, height: 5 },
//                         shadowRadius: 5,
//                         shadowOpacity: 0.5,
//                     }}>
//                         <Entypo
//                             name="clapperboard"
//                             size={26}
//                             color='#fff'
//                             style={{
//                                 lineHeight: 58,
//                                 textAlign: "center",

//                             }}
//                         />
//                     </View>

//                 )
//             }
//         },
//         Search: {
//             screen: SearchScreen,
//             navigationOptions: {
//                 headerShown: false,
//                 tabBarIcon: ({ tintColor }) => <Entypo name="magnifying-glass" size={24} color={tintColor} />
//             }
//         },
//         Profile: {
//             screen: ProfileContainer,
//             navigationOptions: {
//                 headerShown: false,
//                 tabBarIcon: ({ tintColor }) => <Entypo name="user" size={24} color={tintColor} />
//             }
//         }
//     },
//     {
//         defaultNavigationOptions: {
//             tabBarOnPress: ({ navigation, defaultHandler }) => {
//                 if (navigation.state.key === "Post") {
//                     navigation.navigate("Carica");
//                 } else {
//                     defaultHandler();
//                 }

//             },
//             headerShown: false,
//         },
//         tabBarOptions: {
//             activeTintColor: "#bf0e37",
//             inactiveTintColor: "#B3ABAF",
//             style: styles.tabBar
//         }
//     }
// );

// const AppContainer = createStackNavigator(
//     {

//         Talent: talentStack,
//         Carica: {
//             screen: PostScreen
//         },
//         User: {
//             screen: UserScreen
//         }
//     },
//     {
//         mode: "modal",
//         defaultNavigationOptions: {
//             headerShown: false,
//             headerTransparent: true,

//             headerTintColor: '#fff',
//         }
//     }

// );

// const AuthStack = createStackNavigator({
//     Login: LoginScreen,
//     Register: RegisterScreen,
// });



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
        <HomeStack.Navigator initialRouteName="Timeline">
            <HomeStack.Screen name="Timeline" component={Home2Screen} initialParams={{ nome: nome }} />
            <HomeStack.Screen name="Esplora" component={UVStackComponent} />
        </HomeStack.Navigator>
    )
}

const ChatStack = createStackNavigator();
function ChatStackComponent() {
    return (
        <ChatStack.Navigator initialRouteName="Chat">
            <ChatStack.Screen name="Chat" component={MessageScreen} options={{headerShown:false}}/>
            <ChatStack.Screen name="ChatWith" component={ChatFlavio} options={{}}/>
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
        </ProfileStack.Navigator>
    )
}


const HomeTabs = createBottomTabNavigator();
function HomeTabsComponent({ route, nav }) {
    const { myname } = route.params;
    console.log(`nome is ${Object.keys(route.params)}`);

    return (
        <HomeTabs.Navigator
            initialRouteName="Home">
            <HomeTabs.Screen name="Home" component={HomeStackComponent} initialParams={{ nome: myname }} options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
            }} />
            <HomeTabs.Screen name="Chat" component={ChatStackComponent} options={{
                tabBarLabel: 'Chat',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="chat" color={color} size={size} />
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