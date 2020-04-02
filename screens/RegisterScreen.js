import React from "react";
import { View, Text, StyleSheet,TextInput,TouchableOpacity,Image } from "react-native";

import Fire from "../Fire";

import *as firebase from "firebase";
import * as Facebook from 'expo-facebook';

export default class RegisterScreen extends React.Component {

    state = {
        user: {
            name: "",
            surname:"",
            email: "",
            password: "",
            followed:{},
            follower:{},
            avatar: null
        },
        errorMessage: null
    };

    // CREATE NEW USER AND STORE IT ON FIRESTORE
    handleSignUp = () => {
        Fire.shared.createUser(this.state.user);
    };

    //ON RENDER CHECK IF USER IS LOGGED BY THE FUNCTION
    componentDidMount() {
        this.checkIfLoggedIn();
       }

    // REDIRECT THE USER TO THE HOMESCREEN IF IS LOGGED
    checkIfLoggedIn = () =>{
        firebase.auth().onAuthStateChanged(function(user){
            if(user)
            {
                this.props.navigation.navigate('Home');
            }
        }.bind(this)
        );
    };

 //LOGIN WITH FACEBOOK 
 loginWithFacebook = async () => {
    try {
      await Facebook.initializeAsync('2924791660936019');
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile'],
      });
      if (type === 'success') {

        const credential = firebase.auth.FacebookAuthProvider.credential(token)

        firebase.auth().signInWithCredential(credential).catch((error) => {
          console.log(error)
        });
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }
    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.logo} source={require('../assets/logo.jpeg')}/>
                <Text style={styles.title}>ISCRIVITI</Text>
                <View style={styles.form}>
                <View>
                      <Text style={styles.inputTitle}>Nome</Text>
                      <TextInput
                          style={styles.input}
                          autoCapitalize="none"
                          onChangeText={name => this.setState({ user: { ...this.state.user, name } })}
                          value={this.state.email}
                      ></TextInput>
                  </View>
                  <View>
                      <Text style={styles.inputTitle}>Cognome</Text>
                      <TextInput
                          style={styles.input}
                          autoCapitalize="none"
                          onChangeText={surname => this.setState({ user: { ...this.state.user, surname } })}
                          value={this.state.user.username}
                      ></TextInput>
                  </View>
                  <View>
                      <Text style={styles.inputTitle}>Indirizzo Email</Text>
                      <TextInput
                          style={styles.input}
                          autoCapitalize="none"
                          onChangeText={email => this.setState({ user: { ...this.state.user, email } })}
                          value={this.state.user.email}
                      ></TextInput>
                  </View>

                  <View style={{ marginTop: 32 }}>
                      <Text style={styles.inputTitle}>Password</Text>
                      <TextInput
                          style={styles.input}
                          secureTextEntry
                          autoCapitalize="none"
                          onChangeText={password => this.setState({ user: { ...this.state.user, password } })}
                          value={this.state.user.password}
                      ></TextInput>
                  </View>
             </View>

             <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
                 <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                      <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:15,marginTop:-3 }}>MOSTRA IL TUO TALENTO</Text>
                    </View>
             </TouchableOpacity>
             <Text style={{ fontWeight: "500", color: "#FF5166",marginBottom:20,marginTop:20}}>OPPURE</Text>
             <TouchableOpacity style={styles.FBbutton} onPress={() => this.loginWithFacebook()}>
                 <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                      <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:15,marginTop:-3 }}>CONTINUA SU FACEBOOK</Text>
                    </View>
             </TouchableOpacity>

             <TouchableOpacity
                  style={{ marginTop: 32 }}
                  onPress={() => this.props.navigation.navigate("Login")}
              >
                  <Text style={{ color: "#414959", fontSize: 13 }}>
                    Hai già un account? <Text style={{ fontWeight: "500", color: "#FF5166" }}>ACCEDI</Text>
                  </Text>
              </TouchableOpacity>    
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    title:{
        fontSize:35,
        fontWeight:"600",
        letterSpacing:2,
        marginBottom:20
    },
    form: {
        marginBottom: 48,
        justifyContent:"space-between",
    
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 10,
        textTransform: "uppercase",
        paddingTop:15
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D", 
        width:315
    },
    FBbutton: {
        backgroundColor: "#3b5998",
        padding: 18,
        width:"70%",  
        marginBottom:10,
        borderRadius:30
    },
    button: {
        backgroundColor: "#FF5166",
        padding: 18,
        width:"70%",        
        borderRadius:30

    },
    errorMessage: {
        height: 72,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 30
    },
    error: {
        color: "#E9446A",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center"
    }
});
