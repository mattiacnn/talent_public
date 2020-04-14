import React from "react";
import { Platform, KeyboardAvoidingView, SafeAreaView } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import Fire from "../Fire";
import *as firebase from "firebase";
import 'firebase/firestore';

export default class ChatScreen extends React.Component {
    state = {
        messages: [],
        user:[]
    };
    send = messages => {
        messages.forEach(item => {
            const message = {
                text: item.text,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                user: item.user
            };
            this.db.push(message);
        });
    }
    
    get db() {
        var currentUser = firebase.auth().currentUser.uid
        var userTo = ""
        return firebase.database().ref("chat/messages/");
    }


    _onRefresh = () => {
      this.setState({
          ...this.state,
          refreshing: true
      });

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

    get user() {
        return {
            _id: firebase.auth().currentUser.uid,
            name: this.state.user.name
        };
    }

    componentDidMount() {
        Fire.shared.get(message =>
            this.setState(previous => ({
                messages: GiftedChat.append(previous.messages, message)
            }))
        );
        this._onRefresh()

    }

    componentWillUnmount() {
        Fire.shared.off();
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
