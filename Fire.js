import FirebaseKeys from "./keys";
import firebase from 'firebase';
import 'firebase/firestore';

class Fire {
    constructor() {
        firebase.initializeApp(FirebaseKeys);
        db = firebase.firestore();
        logged = false;
    }

    uploadPhotoAsync = (uri, filename) => {
        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase
                .storage()
                .ref(filename)
                .put(file);

            upload.on(
                "state_changed",
                snapshot => {},
                err => {
                    rej(err);
                },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                }
            );
        });
    };

    handlePost = (text) => {
        firebase.firestore().collection('events').add({
            text: text,
        }); 
    };
    
    createUser = async (user) => {

        return firebase.auth().createUserWithEmailAndPassword(user.email, user.password)

    }

    signIn = () =>{
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((user)=>{
            if(user){ this.logged = true}
        }).catch(function(error) {console.log(error)});
    }

    signOut = () => {
        firebase.auth().signOut();
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
    };

    parse = message => {
        const { user, text, timestamp } = message.val();
        const { key: _id } = message;
        const createdAt = new Date(timestamp);

        return {
            _id,
            createdAt,
            text,
            user
        };
    };

    get = callback => {
        this.db.on("child_added", snapshot => callback(this.parse(snapshot)));
    };

    off() {
        this.db.off();
    }

    get db() {
        return firebase.database().ref("messages");
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get user() {
        const id = firebase.auth().currentUser.uid;
        if (id) {
            firebase.firestore.collection('users').doc(id).get()
        } 
    }

    get firestore() {
        return firebase.firestore();
    }

    get timestamp() {
        return Date.now();
    }
}

export default new Fire;