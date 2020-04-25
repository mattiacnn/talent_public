import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { withGlobalContext } from '../GlobalContext';
import firebase from 'firebase';
import 'firebase/firestore';

class ChatFlavio extends React.Component {
    static navigationOptions = ({ route }) => ({
        title: (route.params || {}).name || 'Chat!'
    });

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            chatId: this.props.route.params.chatId,
            recipient: this.props.route.params.recipient,
        };
    }

    componentDidMount() {

        this.loadMessages(message => {
            this.setState(previousState => {
                return {
                    messages: GiftedChat.append(previousState.messages, message)
                };
            });
        });

    }

    sendMessage=(msg)=> {
        //console.log('messaggio mandato roa',msg[0].text); return
        //this.setState({lastMessage: msg[0]});
        var that = this;
        firebase
            .firestore()
            .collection("chats")
            .doc(that.state.chatId)
            .collection("messages").add(msg[0]);

        this.sendPushNotification(msg[0].text)    
    }

    async loadMessages(callback) {
        var that = this;
        //var recipientId = this.props.navigation.getParam("recipientId");
        var chatId = this.state.chatId;
        console.log(chatId)
        firebase.firestore().collection("chats")
        .doc(chatId).collection("messages")
        .orderBy("createdAt", "asc")
            .onSnapshot(function (doc) {
                doc.docChanges().forEach(message => {
                    var id = message.doc.id;
                    message = message.doc.data();
                    console.log("message:",message)
                    const newMessage = {
                        _id: id,
                        text: message.text,
                        createdAt: message.createdAt.toDate(),
                        user: {
                            _id: message.user._id,
                            name: message.user.name,
                            avatar: message.avatar
                        }
                    };
                    callback(newMessage);
                });
            });
    }

    _handleNotification = notification => {
        Vibration.vibrate();
        console.log(notification);
        this.setState({ notification: notification });
      };
    
      // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
      sendPushNotification = async (msg) => {
        const message = {
          to: this.state.recipient.token,
          sound: 'default',
          title:  `Nuovo messaggio da  ${this.props.global.user.name}`,
          body: msg,
          data: { data: 'goes here' },
          _displayInForeground: true,
        };
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      };

    render() {
        const user = {
            _id: this.props.global.user._id,
            name: this.props.global.user.name,
            avatar: this.props.global.user.avatar
        };
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={(m)=>{this.sendMessage(m)}}
                user={user}
            />
        );
    }
}

export default withGlobalContext(ChatFlavio);