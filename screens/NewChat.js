import React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView,FlatList,TextInput } from 'react-native';
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { Right } from "native-base";

export default class NewChat extends React.Component {

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

        return(
            <SafeAreaView style={styles.container}>
                <View style={{justifyContent:"center"}}>
                    <Text style={styles.title}>Nuova Chat</Text>    
                </View>
                    <View style={styles.searchSection}>
                        <Entypo name="magnifying-glass" size={24} color="white" style={styles.searchIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="A chi vuoi inviare il messaggio?"
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
                    data={this.state.usersFound}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.searchSection} onPress={() => {
                            this.props.navigation.navigate('Chat', {
                                user: item
                            })
                        }}>
                            <Image style={styles.avatar} source={
                                                this.state.isImageAvailable
                                                    ? this.state.profilePic
                                                    : require("../assets/tempAvatar.jpg")
                                            } ></Image>
                            <Text style={{fontWeight:"bold",paddingLeft:20, color:"#EE1D52"}}>{item.user.username}</Text>   
                        </TouchableOpacity>

                     )}
                            numColumns={1}
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
