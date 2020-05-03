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
    var s = require('../style');

    LayoutAnimation.easeInEaseOut();

    return (
      <KeyboardAvoidingView>
        <ScrollView style={{ height:"100%", backgroundColor: "white" }}>
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
              <TouchableOpacity style={{ ...s.button, backgroundColor: "#3b5998" }} onPress={() => this.loginWithFacebook()}>
                <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, textAlign: "center", fontSize: 15, }}>Accedi con Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={s.formItem}>
              <TouchableOpacity
                style={{ alignSelf: 'center' }}
                onPress={() => {
                  this.props.navigation.navigate('Registrati');
                }}
              >
                <Text style={{ fontSize: 13 }}>
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
