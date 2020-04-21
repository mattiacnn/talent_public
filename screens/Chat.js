import React from "react";
import { Platform, KeyboardAvoidingView, SafeAreaView } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import Fire from "../Fire";
import *as firebase from "firebase";
import 'firebase/firestore';

export default class Chat extends React.Component {
    state = {
        messages: [],
        user:[],
        userFound:[]
    };
    send = messages => {
        messages.forEach(item => {
            var currentUser =firebase.auth().currentUser.uid;
            var userTo = this.props.navigation.getParam('id');
            const message = {
                text: item.text,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                user: item.user,
                partecipanti: [currentUser, userTo ]
            };
            firebase.database().ref("chat/" + currentUser  + userTo).push(message);

        });
    }
    

    _onRefresh = () => {
      this.setState({
          ...this.state,
          refreshing: true
      });
      let id = firebase.auth().currentUser.uid;
      firebase.firestore().collection('users').doc(id).get()
          .then(doc => {
              this.setState({
                  ...this.state,
                  user: doc.data(),
                  refreshing: false
              });
          })
          .catch(err => {
              console.log('Error getting documents', err);
          });
  }

    get = callback => {
        var currentUser =firebase.auth().currentUser.uid;
        var userTo = this.props.navigation.getParam('id');
        console.log(`chat/${currentUser}/${userTo}`)
        firebase.database().ref(`chat/${currentUser}${userTo}`).on("child_added", snapshot => callback(this.parse(snapshot)));
    };



    parse = message => {
        const { user, text, timestamp, partecipanti } = message.val();
        const { key: _id } = message;
        const createdAt = new Date(timestamp);

        return {
            _id,
            createdAt,
            text,
            user,
            partecipanti
        };
    };
    
    get user() {
        return {
            _id: firebase.auth().currentUser.uid,
            name: this.state.user.name
        };
    }

    componentDidMount() {    
        this._onRefresh()

        this.get(message =>
            this.setState(previous => ({
                messages: GiftedChat.append(previous.messages, message)
            }))
        );
    }

    componentWillUnmount() {
        Fire.off();
    }

    render() {
        const chat = <GiftedChat messages={this.state.messages} onSend={this.send} user={this.user} />;

        if (Platform.OS === "android") {
            return (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={30} enabled>
                    {chat}
                </KeyboardAvoidingView>
            );
        }

        return <SafeAreaView style={{ flex: 1 }}>{chat}</SafeAreaView>;
    }
}
