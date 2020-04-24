import React from "react";
import { View, Image, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import HideContainer from "./HideContainer";
import BarraRicerca from "../components/BarraRicerca";
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

const posts = [
    {
        id: '1',
        name: 'John McKay',
        text:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        timestamp: 1569109273726,
        avatar: require('../assets/sample.jpg'),
        image: require('../assets/sample.jpg')
    },
    {
        id: '2',
        name: 'Karyn Kim',
        text:
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        timestamp: 1569109273726,
        avatar: require('../assets/tempAvatar.jpg'),
        image: require('../assets/sample.jpg')
    },
    {
        id: '3',
        name: 'Emerson Parsons',
        text:
            'Amet mattis vulputate enim nulla aliquet porttitor lacus luctus. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant.',
        timestamp: 1569109273726,
        avatar: require('../assets/tempAvatar.jpg'),
        image: require('../assets/sample.jpg')
    },
    {
        id: '4',
        name: 'Kathie Malone',
        text:
            'At varius vel pharetra vel turpis nunc eget lorem. Lorem mollis aliquam ut porttitor leo a diam sollicitudin tempor. Adipiscing tristique risus nec feugiat in fermentum.',
        timestamp: 1569109273726,
        avatar: require('../assets/tempAvatar.jpg'),
        image: require('../assets/sample.jpg')
    }
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
            hide: false
        };
    }

    componentDidMount() {
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
            // console.log(that.state.dataSource);
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

        return (<View style={{ backgroundColor: "#1f1f1f", height: Dimensions.get('screen').height }}>
            <SafeAreaView>
                <BarraRicerca navigation={this.props.navigation}/>
                <View style={styles.MainContainer}>
                    <FlatList
                        data={this.state.dataSource}
                        renderItem={({ item }) => (
                            <View style={{ flex: 1, flexDirection: 'column', margin: 2}}>
                                <TouchableOpacity onPress={()=>console.log('touch')}>
                                    <Image style={styles.imageThumbnail} source={{uri:item.thumbnail}} />
                                </TouchableOpacity>
                            </View>
                        )}
                        //Setting the number of column
                        numColumns={3}
                        keyExtractor={(item) => item.id}
                    />
                </View>
            </SafeAreaView>

        </View >);


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


