import React, { useRef, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Container, Header, Button, Thumbnail, Left, Body, Item, Input, Icon } from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity, Modal, View, Text, Animated,FlatList,Image } from "react-native";
import { withGlobalContext } from "../GlobalContext";


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

export default class RisultatiRicerca extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    

    render() {
        return (
            <View style={{backgroundColor:"black",width:Dimensions.get('window').width, marginTop:10,alignSelf:"center", }}>
                <FlatList
                    contentContainerStyle={{minHeight:Dimensions.get('screen').height}}
                    data={this.props.usersFound}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.searchSection} onPress={() => {
                            //console.log(item);
                            this.props.navigation.push('Esplora', {
                                screen: 'Utente',
                                params: {
                                  user:item
                                },
                              });
                        }}>
                            <Image style={styles.roundedAvatar} source={item.avatar?  { uri: item.avatar }
                                                    : require("../assets/tempAvatar.jpg")
                                            } ></Image>
                            <Text style={{fontWeight:"bold",paddingLeft:20, color:"white"}}>{item.username}</Text>   
                        </TouchableOpacity>
        
                     )}
                            keyExtractor={(item) => item.id}
                        />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    roundedAvatar: {
        width: 45,
        height: 45,
        borderRadius: 30,
        marginLeft: 20
    },
    MainContainer: {
        justifyContent: 'center',
        alignSelf:"center",
        width:Dimensions.get('screen').width,
        height:Dimensions.get('screen').height,
        top:50,
    },
    imageThumbnail: {
        width:Dimensions.get('screen').width/3 -6 ,
        height:200,
    },
    cover: {
        width: 300,
        height: 300
    },
   
    searchSection: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: "90%"
    },
    searchIcon: {
        padding: 10,

    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        height: 48,
        marginRight: 10,
        backgroundColor: "#242424",
        color: "#999999"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
});
