import React from "react";
import { View, Image, Text, StyleSheet,FlatList,Dimensions,TouchableOpacity } from "react-native";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { ScrollView, TextInput } from "react-native-gesture-handler";
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";

function Item(item) {
    return (
        <View style={styles.item}>
            <Image
                style={styles.post}
                source={{
                    uri: item.pic,
                }} 
            />
       </View> 

    );
            }

export default class GlobalFeed extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: { followers: { id_users: [] }, followed: { id_users: [] } },
            isImageAvailable: false,
            visible: false,
            dataSource: [],
            selectedVideo: null,
            search:"",
            query:""
        };
    }

    updateSearch = search => {
        this.setState({ search });
      };


    searchFromDb = async () =>{
        firebase.firestore().collection("users").where("username", "==", this.state.query)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data().username);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

        
    }
    
    componentDidMount() {
        this.searchFromDb();
    }
    render() {
        const { search } = this.state;
        const data = [
            {
              id: 'bd7acbea-23432432-46c2-aed5-3ad53abb28ba',
              title: '1',
              pic: "https://images.unsplash.com/photo-1586233520069-dff24f171ada?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
            },
            {
              id: '3ac68afc-5345345-48d3-a4f8-fbd91aa97f63',
              title: '2',
              pic: "https://images.unsplash.com/photo-1586253225483-1d66d0dc8bc4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"

            },
            {
              id: '58694a0f-345345345-471f-bd96-145571e29d72',
              title: '3',
              pic: "https://images.unsplash.com/photo-1586328565567-411708a1372e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"

            },
            {
                id: '324234234556-c1b1-46c2-aed5-3ad53abb28ba',
                title: '4',
                pic: "https://images.unsplash.com/photo-1586312112041-ec4c4d1d47d3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
              },
              {
                id: '324234234-c605-48d3-a4f8-fbd91aa97f63',
                title: '5',
                pic: "https://images.unsplash.com/photo-1586304491217-6b4fa86e414c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80"
  
              },
              {
                id: '3423425-3da1-471f-bd96-145571e29d72',
                title: '6',
                pic: "https://images.unsplash.com/photo-1586302670664-e8c8174985e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  
              },
              {
                id: '3423425-3da1-471f-bd96-145571e29d72',
                title: '6',
                pic: "https://images.unsplash.com/photo-1586294839852-650d52bb6923?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  
              },
              {
                id: '23231243344-3da1-471f-bd96-145571e29d72',
                title: '6',
                pic: "https://images.unsplash.com/photo-1572788806037-30ac9345ec52?ixlib=rb-1.2.1&auto=format&fit=crop&w=632&q=80"
  
              },
              {
                id: 'srtywers5345-3da1-471f-bd96-145571e29d72',
                title: '6',
                pic: "https://images.unsplash.com/photo-1573475516777-1d03b1ae3cd4?ixlib=rb-1.2.1&auto=format&fit=crop&w=632&q=80"
  
              },
          ];

        return (
            <View style={styles.container}>
                    <TouchableOpacity style={styles.searchSection} onPress={() => this.props.navigation.navigate('Search')}>
                    <Entypo name="magnifying-glass" size={24} color="black" style={styles.searchIcon} />
                    <Text style={styles.input} placeholder="cerca">Cerca...</Text>
                    </TouchableOpacity>
                <ScrollView>
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <TouchableOpacity >
                            <Image style={styles.post} source={{ uri: item.pic }} />
                        </TouchableOpacity>
                     )}
                            numColumns={3}
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
        width:Dimensions.get("window").width/3,
        margin: 1,

        },
        searchSection: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
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
            backgroundColor: '#fff',
            color: '#424242',
        },

});
