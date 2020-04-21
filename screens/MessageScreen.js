import React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView,FlatList,TextInput } from 'react-native';
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { Right } from "native-base";

export default class ChatScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            usersFound:{},
            isImageAvailable: false,
            visible: false,
            profilePic: null,
            dataSource: [],
            selectedVideo: null,
            searchString:"",
            query:"",
            search:""
        };
    }

    
    updateSearch = search => {
        this.setState({ search });
      };

      getChat = () =>{
        firebase.database().ref("chat/").where('id', 'array-contains-any',
        ['1', 'east_coast']);
      }


    render() {
        const chats = [
            {
                id:1, username:"Mattiacnn",message:"ciao come stai?"
            },
            {
                id:2, username:"Flaviocnn",message:"ciao come stai?"
            },
            {
                id:3, username:"Carlo23",message:"ciao come stai?"
            },
            {
                id:4, username:"Melo86",message:"ciao come stai?"
            },
            {
                id:5, username:"GiuliaSpa",message:"ciao come stai?"
            },
            {
                id:6, username:"GabryTeletabies",message:"ciao come stai?"
            },

        ]
        const { search } = this.state;

        return(
            <SafeAreaView style={styles.container}>
                <View style={{justifyContent:"center"}}>
                    <Text style={styles.title}>Chat</Text>    
                    <Entypo name="circle-with-plus" size={24} color="white" style={styles.circle}  onPress={() => {
                            this.props.navigation.navigate('NewChat')
                    }}></Entypo>
                </View>
                    <View style={styles.searchSection}>
                        <Entypo name="magnifying-glass" size={24} color="white" style={styles.searchIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="User Nickname"
                            value={search}
                            onEndEditing={this.searchFromDb}                           
                            onChangeText={this.updateSearch}
                            underlineColorAndroid="transparent"
                            autoFocus={true} 
                            placeholderTextColor="white"

                        />
                    </View>
                <ScrollView style={{width:"100%"}}>
                <FlatList
                    data={chats}
                    renderItem={({ item }) => (
                        <TouchableOpacity  style={styles.row}>
                        <Image
                                source={
                                    require("../assets/tempAvatar.jpg")
                                     }
                                 style={styles.avatar}
                                    />
                            <View style={styles.column}>
                                <Text style={styles.name}>
                                        {item.username}
                                </Text>
                                <Text style={styles.message}>
                                    {item.message}
                                </Text>
                            </View>        
                        </TouchableOpacity>
                    )}
                            keyExtractor={(item) => item.id}
                        />
                </ScrollView>
            </SafeAreaView>
            )
    }
    
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:"flex-start",
        backgroundColor:"#0f0104"
    },
    row:{
        height:80,
        width:"100%",
        flexDirection:"row",
        alignItems:"center",
    },
    column:{
        flexDirection:"column"
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 68,
        marginLeft:10
    },
    name: {
        fontSize:18,
        fontWeight:"bold",
        marginLeft:20,
        color:"#EE1D52"
    },
    message:{
        fontSize:15,
        color:"gray",
        marginLeft:20,
        marginTop:5
    },
    searchSection: {
        height:60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#0f0104',
    },
    searchIcon: {
        padding: 10,
        marginLeft:20,
        backgroundColor: '#1C1C1C',

    },
    circle:{
        padding: 10,
        marginRight:20,
        alignSelf:"flex-end"
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        height:48,
        backgroundColor: '#1C1C1C',
        color: 'white',
        marginRight:10
    },
    title:{
        color:"white",
        fontWeight:"bold",
        fontSize:25,
        alignSelf:"center",
        padding: 10,
    }


})
