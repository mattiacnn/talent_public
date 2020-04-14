import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  LayoutAnimation
} from 'react-native';
import * as firebase from 'firebase';
import * as Facebook from 'expo-facebook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: false
  };

  state = {
    email: '',
    password: '',
    errorMessage: null
  };

  handleLogin = () => {
    const { email, password } = this.state;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => this.setState({ errorMessage: error.message }));
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
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={s.container}
        scrollEnabled={true}
      >
        <StatusBar barStyle='light-content'></StatusBar>
        <Image
          source={require('../assets/authHeader.png')}
          style={{ marginTop: -196, marginLeft: -50, position: "absolute" }}
        ></Image>
        <Image
          source={require('../assets/authFooter.png')}
          style={{ position: 'absolute', bottom: -325, right: -225 }}
        ></Image>
        <Image
          source={require('../assets/loginLogo.png')}
          style={{ alignSelf: 'center', position: "absolute", top: 50 }}
        ></Image>
        <Text style={{ ...s.greeting, marginTop: 200 }}>{'Ciao!\nBen tornato.'}</Text>

        <View style={s.errorMessage}>
          {this.state.errorMessage && (
            <Text style={s.error}> {this.state.errorMessage} </Text>
          )}
        </View>

        <View style={s.form}>
          <View>
            <Text style={s.inputTitle}>Email</Text>
            <TextInput
              style={s.input}
              autoCapitalize='none'
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            ></TextInput>
          </View>

          <View style={{ marginTop: 32 }}>
            <Text style={s.inputTitle}>Password</Text>
            <TextInput
              style={s.input}
              secureTextEntry
              autoCapitalize='none'
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            ></TextInput>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "space-around", flexDirection: "column", alignItems: "stretch" }}>
          <TouchableOpacity style={s.button} onPress={this.handleLogin}>
            <Text style={{ color: '#fff', fontWeight: '500' }}>Accedi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ ...s.button, backgroundColor: "#3b5998" }} onPress={() => this.loginWithFacebook()}>
            <Text style={{ color: "#FFF", fontWeight: "500", letterSpacing: 2, textAlign: "center", fontSize: 15, }}>Accedi con Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignSelf: 'center' }}
            onPress={() => {
              this.props.navigation.navigate('Register');
            }}
          >
            <Text style={{ color: '#414959', fontSize: 13 }}>
              Sei nuovo su Talent?{' '}
              <Text style={{ fontWeight: '500', color: '#E9446A' }}>Registrati</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAwareScrollView>
    );
  }
}
