import React from "react";
import { View, Image, Text, StyleSheet,FlatList,Dimensions,TouchableOpacity,SafeAreaView } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import HideContainer from "./HideContainer";



export default class SearchScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            usersFound:[],
            isImageAvailable: false,
            visible: false,
            profilePic: null,
            dataSource: [],
            selectedVideo: null,
            searchString:"",
            query:"",
            search:"",
            selectedItems: [],
            hide:false
        };
    }

    updateSearch = search => {
        this.setState({ search });
      };


    searchFromDb = async () =>{
        var that = this;
        const queryText = that.state.search;
        firebase.firestore().collection("users").orderBy("username").startAt(queryText).endAt(queryText+"\uf8ff")
        .get()
        .then(function(querySnapshot) {
            var usersFound = [];
            querySnapshot.forEach(function(doc) {
                const user = doc.data();
                user.id = doc.id;
                usersFound.push(user);
            });
            that.setState({usersFound: usersFound});  
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

}
    onSelectedItemsChange = (selectedItems) => {

        this.setState({ selectedItems });
    }

    getUserData() {
        let id = firebase.auth().currentUser.uid;

        firebase.firestore().collection('users').doc(id).get()
            .then(doc => {
                console.log(doc.id, doc.data());

                this.setState({
                    ...this.state,
                    user: doc.data(),
                    refreshing: false
                });
                console.log(this.state.user);
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    componentDidMount()
    {
        this.getUserData()
    }

    hideManually = () =>{
        console.log("ciao")
    }
    render() {
        const { search } = this.state;
        const items = [
            // this is the parent or 'item'
            {
              name: 'Categorie',
              id: 0,
              // these are the children or 'sub items'
              children: [
                {
                  name: 'Apple',
                  id: 10,
                },
                {
                  name: 'Strawberry',
                  id: 17,
                },
                {
                  name: 'Pineapple',
                  id: 13,
                },
                {
                  name: 'Banana',
                  id: 14,
                },
                {
                  name: 'Watermelon',
                  id: 15,
                },
                {
                  name: 'Kiwi fruit',
                  id: 16,
                },
              ],
            }
          
          ];
        return (
            /*
            <SafeAreaView style={styles.container}>
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
                        <Text style={{marginRight:20, color:"white"}}>Annulla</Text>
                    </View>

                <ScrollView style={{width:"100%"}}>
                
                <FlatList
                    data={this.state.usersFound}
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
                            <Text style={{fontWeight:"bold",paddingLeft:20}}>{item.username}</Text>   
                        </TouchableOpacity>

                     )}
                            numColumns={1}
                            keyExtractor={(item) => item.email}
                        />
                        
                </ScrollView>
            </SafeAreaView>
            */
           <HideContainer hide={this.state.hide} hideManually={this.hideManually()}>
               <SafeAreaView>
               <View style={styles.searchSection}>
               <Entypo name="magnifying-glass" size={24} color="white" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Cerca Per Nickname"
                    value={search}
                    onEndEditing={this.searchFromDb}                           
                    onChangeText={this.updateSearch}
                    underlineColorAndroid="transparent"
                    autoFocus={false} 
                    placeholderTextColor="#8a8f9e"
                    onFocus={() => this.setState({hide:true})}                    

                />


                </View>
               </SafeAreaView>
                <ScrollView style={{width:"100%"}}>

                  <View style={{height:90,marginTop:10,width:"90%",marginLeft:20}}>
                    <ScrollView horizontal={true} contentContainerStyle={styles.row}  >
                        <SectionedMultiSelect
                            items={items}
                            uniqueKey="name"
                            subKey="children"
                            selectText="Categorie"
                            showDropDowns={true}
                            readOnlyHeadings={true}
                            onSelectedItemsChange={this.onSelectedItemsChange}
                            selectedItems={this.state.selectedItems}
                            confirmText="conferma"
                            modalWithSafeAreaView={true}
                            selectedText="selezionate"
                            searchPlaceholderText="Cerca categoria"
                            colors={{ primary: "#EE1D52" }}
                            styles={{
                                selectToggle: {
                                width: 100,
                                margin:10
                                },

                                selectToggleText: {
                                color: '#EE1D52',
                                zIndex: 10
                                },
                                
                            }}
                            />
                                <Text style={{color:"#EE1D52",margin:12,fontSize:16}}>New Entry</Text>
                                <Text style={{color:"#EE1D52", margin:13,fontSize:16}}>Best of the week</Text>
                    </ScrollView>    
                 </View>                                                 
                
                <FlatList
                        contentContainerStyle={{ marginTop: 20 }}
                        horizontal={false}
                        numColumns={3}
                        data={this.state.user?.user_videos}
                        renderItem={({ item }) => (

                            <View style={
                                {
                                    flex: 1 / 3,
                                    margin: 5,
                                    backgroundColor: '#fafafa',
                                    height: 200,
                                    borderRadius: 5,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 9.84,

                                    elevation: 5,

                                }
                            }>
                                <View style={{ height: "100%", width: "100%", flexDirection: "column", overflow: "hidden" }}>
                                    <TouchableOpacity style={{ flex: 8 }} onPress={() => this.props.navigation.navigate('Video', {
                                        video: item
                                    })}>
                                        <Image source={{ uri: item.thumbnail }} style={{ flex: 1, borderRadius: 5 }}></Image>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-end", height: "100%" }}>
                                        <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.likes} </Text>
                                        <Entypo name="star-outlined" size={18} color={"#EE1D52"} />
                                    </View>
                                </View>
                            </View>
                        )}
                        //Setting the number of column
                        keyExtractor={(item) => item.id}
                    />
                        
                </ScrollView>
           </HideContainer>
          
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
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
            justifyContent: 'center',
            alignItems: 'center',
            width:"95%",
            backgroundColor:"#1C1C1C",
            margin:10
  
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
            height:48,
            marginRight:10,
            color:"#8a8f9e",
            backgroundColor:"#1C1C1C",
  
        },
    row:{
        flexDirection:"row",
        justifyContent:"space-around"
    }
});


