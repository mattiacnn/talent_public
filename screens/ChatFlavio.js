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
        };
    }

    componentDidMount() {
        //console.log(this.props.route.params.chatID);

        this.loadMessages(message => {
            this.setState(previousState => {
                return {
                    messages: GiftedChat.append(previousState.messages, message)
                };
            });
        });

    }

    sendMessage=(msg)=> {
        //console.log(msg);
        var that = this;
        firebase
            .firestore()
            .collection("chats")
            .doc(that.state.chatId)
            .collection("messages").add(msg[0])
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