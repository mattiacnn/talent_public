import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { Container, Header, Button, Thumbnail, Left, Body, Item, Input, Icon } from 'native-base';
import { StyleSheet, Dimensions, TouchableOpacity, Modal, View, Text } from "react-native";
import { withGlobalContext } from "../GlobalContext";
import RisultatiRicerca from "./RisultatiRicerca";
import * as Animatable from 'react-native-animatable';
import *as firebase from "firebase";
import 'firebase/firestore';

const showAnimation = "slideInUp"
const hideAnimation = "slideOutDown"
const fadeIn = {
    from: {
      opacity: 0,
      height:0
    },
    to: {
      opacity: 1,
      height:600
    },
  };

  const fadeOut = {
    from: {
      opacity: 1,
      height:600
    },
    to: {
      opacity: 0,
      height:0
    },
  };
  
class BarraRicerca extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            anim: false
        };
        this.searchInput = React.createRef();
    }

    openModal = () => {
        this.setState({ isModalVisible: true })
    }

    closeModal = () => {
        this.setState({ isModalVisible: false })
    }

    toggle = () => {
        console.log('toggle');
        if (!this.state.show)
            this.setState({
                show: true,
                anim: true
            })
        else {
            this.setState({
                anim: false,
                show:false
            })
        }

    }

    searchFromDb = async () => {
        var that = this;
        const queryText = that.state.search;
        firebase.firestore().collection("users").orderBy("username")
        .startAt(queryText).endAt(queryText + "\uf8ff")
            .get()
            .then(function (querySnapshot) {
                var usersFound = [];
                querySnapshot.forEach(function (doc) {
                    let user = doc.data();
                    user.id = doc.id;
                    usersFound.push(user);
                });
                that.setState({ usersFound});
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });

    }

    render() {
        return (
            <View style={{ marginHorizontal: 15, zIndex:2,position:"relative" }}>
                <Item style={styles.item }>
                    <Ionicons name="ios-search" size={24} color={"#9c9c9c"}></Ionicons>
                    <Input
                        ref={input => {
                            console.log("onref");
                            this.searchInput = input ;
                          }}
                        style={{ color: "#fff" }}
                        onFocus={()=>{this.setState({
                            show: true,
                            anim: true
                        })}}
                        placeholderTextColor="#9c9c9c"
                        placeholder='Inserisci username' 
                        onEndEditing={this.searchFromDb}                           
                        onChangeText={(search)=>{this.setState({ search })}}
                        returnKeyType={"done"}
                    />
                    {this.state.show ? (
                    <TouchableOpacity 
                    style={{ marginHorizontal: 5 }} 
                    onPress={ () => {
                        this.setState(
                            {
                                show: false,
                                anim: false
                            });
                        this.searchInput._root.blur() ;
                        }}
                    >
                        <Text style={{ fontWeight: "bold", color: "white" }}>Annulla</Text>
                    </TouchableOpacity>): (<></>)}
                </Item>
                <Animatable.View animation={this.state.anim ? fadeIn : fadeOut} duration={500}>
                    <RisultatiRicerca usersFound={this.state.usersFound} navigation ={this.props.navigation}></RisultatiRicerca>
                </Animatable.View>
            </View>

        )
    }
}

export default withGlobalContext(BarraRicerca);

const styles = StyleSheet.create({
    item: {
        height: 38, marginTop: 10, paddingHorizontal: 10,
        flexDirection: "row", justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        borderRadius: 10, borderColor: "transparent",
        alignSelf: "center"
    },
});