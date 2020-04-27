import React from 'react';
import firebase from 'firebase';

const GlobalContext = React.createContext({});

export class GlobalContextProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOnline: "si",
            messaggio: "vuoto",
            user: {},
            chats: []
        }
    }

    componentDidMount() {
        var that = this;
        firebase.auth().onAuthStateChanged(user => {
            console.log("global changed");
            if (user) {
                var unsubscribe = firebase.firestore().collection('users').doc(user.uid)
                    .onSnapshot(snapshot => {
                        console.log("user update");
                        let utenteRicevuto = snapshot.data() || {};
                        utenteRicevuto.id = user.uid;
                        utenteRicevuto._id = user.uid;
                        that.setState({ user: { ...that.state.user, ...utenteRicevuto } });
                    }, err => { console.log(err); }
                    );

                firebase.firestore().collection('videos').where("owner", "==", user.uid)
                    .onSnapshot(doc => {
                        doc.docChanges().forEach(video => {
                            if (video.type === 'added') {
                                console.log('added');
                                var id = video.doc.id;
                                console.log("new video:" + id);
                                video = video.doc.data();
                                video.id = id;

                                let user_videos = that.state.user.user_videos;
                                user_videos.push(video);
                                that.setState({ user: { ...that.state.user, user_videos } });
                            }

                        });
                    }, err => { console.log(err); }
                    );

                firebase.firestore().collection('chats').where("between", "array-contains", user.uid)
                    .onSnapshot(doc => {
                        doc.docChanges().forEach(chat => {
                            if (chat.type === 'added') {
                                console.log('chat:added ');
                            }
                            var id = chat.doc.id;
                            console.log("new chat:" + id);
                            chat = chat.doc.data();
                            chat.id = id;

                            const myIndex = chat.between.indexOf(user.uid);
                            // if i am 0, other is 1 and viceversa
                            chat.otherIndex = +!myIndex; // cast index to boolean and then to number

                            let chats = that.state.chats;
                            chats.push(chat);
                            that.setState({ chats });
                        });
                    }, err => { console.log(err); }
                    );

                firebase.firestore().collection('counters').doc(user.uid)
                    .onSnapshot(doc => {
                        const counters = doc.data();
                        that.setState({
                            user: {
                                ...that.state.user,
                                like_count: counters.like_count,
                                followed_count: counters.followed_count,
                                followers_count: counters.followers_count
                            }
                        });

                    }, err => { console.log(err); }
                    );
            }
        });
    }

    switchToOnline = () => {
        this.setState({ isOnline: "true" });
    }

    switchToOffline = () => {
        this.setState({ isOnline: "false" });
    }

    render() {
        return (
            <GlobalContext.Provider
                value={{
                    ...this.state,
                    switchToOnline: this.switchToOnline,
                    switchToOffline: this.switchToOffline
                }}
            >
                {this.props.children}
            </GlobalContext.Provider>
        )
    }
}

// create the consumer as higher order component
export const withGlobalContext = ChildComponent => props => (
    <GlobalContext.Consumer>
        {
            context => <ChildComponent {...props} global={context} />
        }
    </GlobalContext.Consumer>
);