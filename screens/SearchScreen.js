import React from "react";
import { View, Image, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { ScrollView, TextInput, TouchableHighlight } from "react-native-gesture-handler";
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import HideContainer from "./HideContainer";
import BarraRicerca from "../components/BarraRicerca";



const categorie = [
    {
        id: '1',
        name: 'New Entry',
    },
    {
        id: '2',
        name: 'Canto',
    },
    {
        id: '3',
        name: 'Musica',
    },
    {
        id: '4',
        name: 'Comicità',
    },
    {
        id: '5',
        name: 'Magia',
    },
    {
        id: '6',
        name: 'Moda',
    },
    {
        id: '7',
        name: 'Tik Tok',
    },
    {
        id: '8',
        name: 'Recitazione',
    },
    {
        id: '9',
        name: 'Sport',
    },
    {
        id: '10',
        name: 'Best of the week',
    },


];

export default class SearchScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            usersFound: [],
            isImageAvailable: false,
            visible: false,
            profilePic: null,
            dataSource: [],
            selectedVideo: null,
            searchString: "",
            query: "",
            search: "",
            selectedItems: [],
            hide: false,
            videoToShow:[],
            categoria: "",
            active:"New Entry"
        };
    }

    searchFromDb = async (categoria) => {
        if (categoria == "New Entry")
        {
            this.setState({active: categoria})

            var that = this;
            firebase.firestore().collection("videos").orderBy("createdAt", "desc").limit(50)
            .get()
            .then(function (querySnapshot) {
                var globalVideos = [];
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    globalVideos.push(doc.data());
                });
                that.setState({dataSource:globalVideos});
                //console.log(that.state.dataSource);
                // console.log(globalVideos);
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
        }
        else{
            this.setState({active: categoria})
            var that = this;
            firebase.firestore().collection("videos").where("categories", "array-contains", categoria)
                .get()
                .then(function (querySnapshot) {
                    var videosFound = [];
                    querySnapshot.forEach(function (doc) {
                        videosFound.push(doc.data());
                    });
                    that.setState({ dataSource : videosFound});
                    console.log(that.state.videoToShow)
                })
                .catch(function (error) {
                    console.log("Error getting documents: ", error);
                });
    
        }
    }

    componentDidMount() {
        var that = this;
        firebase.firestore().collection("videos").orderBy("createdAt", "desc").limit(50)
        .get()
        .then(function (querySnapshot) {
            var globalVideos = [];
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                let video = doc.data();
                video.id = doc.id;
                globalVideos.push(video);
            });
            that.setState({dataSource:globalVideos});
            //console.log(that.state.dataSource);
            // console.log(globalVideos);
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
    }

    updateSearch = search => {
        this.setState({ search });
    };

    onSelectedItemsChange = (selectedItems) => {
        this.setState({ selectedItems });
    }

    render() {
        const { search } = this.state;

        return (
            <SafeAreaView  style={{ backgroundColor: "#1f1f1f",  }} >
                <StatusBar>

                </StatusBar>
                <BarraRicerca navigation={this.props.navigation}/>
                <ScrollView horizontal = {true} showsHorizontalScrollIndicator = {false} contentContainerStyle={{marginTop:5,marginBottom:20}} > 
                <FlatList
                        data={categorie}
                        style={{height:70}}
                        renderItem={({ item }) => (
                        <TouchableHighlight style={ this.state.active == item.name? styles.btnActive : styles.chip} onPress={() => this.searchFromDb(item.name)}>
                            <Text style={styles.chipText}>
                                {item.name}
                            </Text>
                        </TouchableHighlight>
                        )}
                        numColumns={10}
                        keyExtractor={(item) => item.id}
                    />
                    
                   
                </ScrollView>
                        <FlatList
                            data={this.state.dataSource}
                            renderItem={({ item }) => (
                                    <TouchableOpacity  style={styles.imageThumbnail}onPress={() => this.props.navigation.navigate('Video', {
                                        video: item,
                                        owner: item.owner
                                    })}>
                                        <Image style={styles.imageThumbnail} source={{uri:item.thumbnail}} />
                                    </TouchableOpacity>
        
                            )}
                            //Setting the number of column
                            numColumns={3}
                            keyExtractor={(item) => item.id}
                        />
            </SafeAreaView>

  );


    }


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

    /* <GlobalFeed></GlobalFeed> */


    /* <View style={styles.searchSection}>
        <Entypo name="magnifying-glass" size={24} color="black" style={styles.searchIcon} />
        <TextInput
            style={styles.input}
            placeholder="Cerca Per Nickname"
            value={search}
            onEndEditing={this.searchFromDb}
            onChangeText={this.updateSearch}
            underlineColorAndroid="transparent"
            onFocus={() => this.setState({ hide: true })}
        />

    </View>

    <ScrollView style={{ width: "100%" }}>
        <View style={{ height: 90, marginTop: 10, width: "90%", marginLeft: 20 }}>
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
                            margin: 10
                        },

                        selectToggleText: {
                            color: '#EE1D52',
                            zIndex: 10
                        },

                    }}
                />
                <Text style={{ color: "#EE1D52", margin: 12, fontSize: 16 }}>New Entry</Text>
                <Text style={{ color: "#EE1D52", margin: 13, fontSize: 16 }}>Best of the week</Text>
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

    </ScrollView> */
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
        width:Dimensions.get('screen').width - 10,
        height:Dimensions.get('screen').height,

        top:50,

    },
    imageThumbnail: {
        height: Dimensions.get('window').width / 2,
        width: Dimensions.get('window').width/3
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
    chip:{
        margin:10,
        borderColor:"#EE1D52",
        borderWidth:1,
        backgroundColor:"transparent",
        paddingTop:8,
        paddingBottom:8,
        paddingRight:15,
        paddingLeft:15,
        borderRadius:20
    },
    chipText:{
        color:"white",
        fontSize:15,
        fontWeight:"700"
    },
    btnActive:{
        margin:10,
        borderWidth:1,
        borderColor:"#EE1D52",
        backgroundColor:"#EE1D52",
        paddingTop:8,
        paddingBottom:8,
        paddingRight:15,
        paddingLeft:15,
        borderRadius:20
    }
});


