import React from 'react';
import { StyleSheet, Text, View,Image,TouchableOpacity,TextInput} from 'react-native';

import * as firebase from 'firebase';
import * as Facebook from 'expo-facebook';


export default class App extends React.Component {
  static navigationOptions = {
    headerShown: false
};
  constructor(props) {
    super(props)

    this.state = ({
      email: '',
      password: ''
    })
  }

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

  //LOGIN WITH EMAIL AND PASSWORD
  loginUser = (email, password) => {
    try {
      firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
        console.log(user)
      })

    }
    catch (error) {
      console.log(error.toString())
    }
  }

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
        <Image style={styles.logo} source={require('../assets/logo.jpeg')} />
        <Text style={styles.title}>Benvenuto</Text>
        <View style={styles.errorMessage}>
              {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
        </View>

          <View style={styles.form}>
              <View>
                  <Text style={styles.inputTitle}>Indirizzo Email</Text>
                  <TextInput
                      style={styles.input}
                      autoCapitalize="none"
                      onChangeText={(email) => this.setState({ email })}
                  ></TextInput>
              </View>

              <View style={{ marginTop: 32 }}>
                  <Text style={styles.inputTitle}>Password</Text>
                  <TextInput
                      style={styles.input}
                      secureTextEntry
                      onChangeText={(password) => this.setState({ password })}
                      >
                  </TextInput>
              </View>
         </View>

         <TouchableOpacity style={styles.button} onPress={() => this.loginUser(this.state.email, this.state.password)}>
             <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                  <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:15,marginTop:-3 }}>Accedi</Text>
                </View>
         </TouchableOpacity>

         <TouchableOpacity style={styles.FBbutton} onPress={() => this.loginWithFacebook()}>
                 <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                      <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:15,marginTop:-3 }}>ACCEDI CON FACEBOOK</Text>
                    </View>
             </TouchableOpacity>

         <TouchableOpacity
              style={{ marginTop: 32 }}
              onPress={() => this.props.navigation.navigate("Register")}
          >
              <Text style={{ color: "#414959", fontSize: 13 }}>
                  Sei nuovo? <Text style={{ fontWeight: "500", color: "#FF5166" }}>Registrati</Text>
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
        justifyContent: "center",
        backgroundColor:"#ffff"
    },

    title:{
        fontSize:35,
        fontWeight:"600",
        letterSpacing:2
    },
    form: {
        marginBottom: 48,
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 10,
        textTransform: "uppercase"
    },
    FBbutton: {
        backgroundColor: "#3b5998",
        padding: 18,
        width:"70%",  
        marginTop:10,
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D", 
        width:315
    },
    button: {
        backgroundColor: "#FF5166",
        padding: 18,
        width:"70%",        
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