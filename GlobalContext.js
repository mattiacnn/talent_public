import React from 'react';
import firebase from 'firebase';

const GlobalContext = React.createContext({});

var unsubscribe = null;

export class GlobalContextProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isOnline: "si",
            messaggio: "vuoto",
            user:{}
        }
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            console.log("global changed");
            if (user) {
                unsubscribe = firebase.firestore().collection('users').doc(user.uid)
                    .onSnapshot((snapshot) => {
                        let utenteRicevuto = snapshot.data();
                        utenteRicevuto.id = user.uid;
                        this.setState({ user: utenteRicevuto });
                    })

                    
                    firebase.firestore().collection('videos').where("owner", "==", user.uid)
                    .onSnapshot((querySnapshot) => {
                        //console.log(querySnapshot);
                        var user_videos = [];
                        querySnapshot.forEach( (doc) => {
                            // doc.data() is never undefined for query doc snapshots
                            user_videos.push({...doc.data(), id: doc.id});
                            //console.log(doc.id, " => ", doc.data());
                        });
                        this.setState({user:{ ...this.state.user, user_videos}});
                        console.log(user_videos.length);
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                    });
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