import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  LayoutAnimation,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import * as firebase from 'firebase';
import * as Facebook from 'expo-facebook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Fire from '../Fire';
import { ScrollView } from 'react-native-gesture-handler';

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorMessage: null
    };
  }


  facebookFirestore = (avatar, email, name, surname, username) =>{
    const uid = firebase.auth().currentUser.uid;
    firebase.firestore().collection("users").doc(uid).set({
      avatar: avatar,
      birthdate: null,
      email: email,
      followed: { id_users: [] },
      follower: { id_users: [] },
      name: name,
      surname: surname,
      username: username
    })
  }

  handleLogin = () => {
    const { email, password } = this.state;

    firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
      if (user) { console.log(user); this.navigation.goBack() }
    }).catch(function (error) { });
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
        permissions: ['public_profile', 'email','user_birthday'],
      });
      if (type === 'success') {
      // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me/?fields=email,id,last_name,short_name,picture,first_name&access_token=${token}`); //<- use the token you got in your request
        const userInfo = await response.json();


        const credential = firebase.auth.FacebookAuthProvider.credential(token)
      
        firebase.auth().signInWithCredential(credential).
        then(
          UC => {
            console.log("EMAIL = ", userInfo.picture.data.url);
            this.facebookFirestore(userInfo.picture.data.url, userInfo.email, userInfo.first_name, userInfo.last_name, userInfo.first_name + userInfo.last_name);
          } 
          //this.facebookFirestore())
        ).catch((error) => {
          console.log(error)
        });

      } 
      else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  render() {
    var s = require('../style');

    LayoutAnimation.easeInEaseOut();

    return (
      <KeyboardAvoidingView>
        <ScrollView style={{ height:"100%", backgroundColor: "black" }}>
          <Image
            source={require('../assets/authHeader.png')}
            style={{ top: -200, left: -50, position: "absolute" }}
          />
          <Image
            source={require('../assets/authFooter.png')}
            style={{ position: 'absolute', bottom: -300, right: -225 }}
          />
          <Image
            source={require('../assets/loginLogo.png')}
            style={{ alignSelf: 'center', position: "absolute", top: 80 }}
          />
          <Text style={s.greeting}>{'Ciao!\nBen tornato.'}</Text>

          <View style={s.form}>

            <View style={s.formItem}>
              <Text style={s.inputTitle}>Email</Text>
              <TextInput
                style={s.input}
                autoCapitalize='none'
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              ></TextInput>
            </View>

            <View style={s.formItem}>
              <Text style={s.inputTitle}>Password</Text>
              <TextInput
                style={s.input}
                secureTextEntry
                autoCapitalize='none'
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              ></TextInput>
            </View>

            <View style={s.formItem}>
              <TouchableOpacity style={s.button} onPress={this.handleLogin}>
                <Text style={{ color: '#fff', fontWeight: '500' }}>Accedi</Text>
              </TouchableOpacity>
            </View>

            <View style={s.formItem}>
              <TouchableOpacity
                style={{ alignSelf: 'center' }}
                onPress={() => {
                  this.props.navigation.navigate('Registrati');
                }}
              >
                <Text style={{ fontSize: 13,color:'white' }}>
                  Sei nuovo su Talent?{' '}
                  <Text style={{ fontWeight: '500' }}>Registrati</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>


      </KeyboardAvoidingView >
    );
  }
}
