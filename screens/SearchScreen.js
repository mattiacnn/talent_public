import React from "react";
import { View, Image, Text, StyleSheet,FlatList,Dimensions,TouchableOpacity } from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { ScrollView, TextInput } from "react-native-gesture-handler";
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { SearchBar } from 'react-native-elements';
import { Button } from "react-native-paper";



export default class SearchScreen extends React.Component {

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


      searchFromDb = async () =>{
        var that = this;
        firebase.firestore().collection("users").orderBy("username").startAt(this.state.search)
        .get()
        .then(function(querySnapshot) {
            var usersFound = [];
            querySnapshot.forEach(function(doc) {
                usersFound.push({id: doc.id, user: doc.data()});
            });
            that.setState({...that.state, usersFound: usersFound});  
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

}

    render() {
        const { search } = this.state;
        
        return (
            <View style={styles.container}>
                    <View style={styles.searchSection}>
                        <Entypo name="magnifying-glass" size={24} color="black" style={styles.searchIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="User Nickname"
                            value={search}
                            onEndEditing={this.searchFromDb}                           
                            onChangeText={this.updateSearch}
                            underlineColorAndroid="transparent"
                            autoFocus={true} 
                        />
                        <Text style={{marginRight:20}}>Annulla</Text>
                    </View>

                <ScrollView style={{width:"100%"}}>
                <FlatList
                    data={this.state.usersFound}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.searchSection} onPress={() => {
                            this.props.navigation.navigate('User', {
                                user: item
                            })
                        }}>
                            <Image style={styles.roundedAvatar} source={
                                                this.state.isImageAvailable
                                                    ? this.state.profilePic
                                                    : require("../assets/tempAvatar.jpg")
                                            } ></Image>
                            <Text style={{fontWeight:"bold",paddingLeft:20}}>{item.user.username}</Text>   
                        </TouchableOpacity>

                     )}
                            numColumns={1}
                            keyExtractor={(item) => item.id}
                        />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start"
    },
    roundedAvatar:{
        width:45,
        height:45,
        borderRadius:30,
        marginLeft:20
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
    cover:{
        width:300,
        height:300
    },
    post:{
        flex: 1,
        height:200,
        width:Dimensions.get("window").width/ 1,
        margin: 1,

        },
        searchSection: {
            height:60,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: '#fff',
        },
        searchIcon: {
            padding: 10,
            marginLeft:20,
            backgroundColor: '#EEEEEE',

        },
        input: {
            flex: 1,
            paddingTop: 10,
            paddingRight: 10,
            paddingBottom: 10,
            paddingLeft: 0,
            height:48,
            backgroundColor: '#EEEEEE',
            color: '#424242',
            marginRight:10
        },

});
