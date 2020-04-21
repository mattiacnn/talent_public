import React from 'react';
import firebase from 'firebase';

const GlobalContext = React.createContext({});

var unsubscribe = null;

export class GlobalContextProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          isOnline: "si",
          messaggio: "vuoto"
        }
      }
    
    componentDidMount () {
        firebase.auth().onAuthStateChanged(user => {
            console.log("global changed");
            if (user) {
                unsubscribe = firebase.firestore().collection('users').doc(user.uid)
                .onSnapshot((snapshot) => {
                    let utenteRicevuto = snapshot.data();
                    utenteRicevuto.id = user.uid;
                    this.setState({ user: utenteRicevuto});
                })
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