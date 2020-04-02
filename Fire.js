import FirebaseKeys from "./keys";
import firebase, { database } from "firebase";
require("firebase/firestore");

class Fire {
    constructor() {
        firebase.initializeApp(FirebaseKeys);
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
    
    createUser = async user => {
        let remoteUri = null;

        try {
            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);

            let db = this.firestore.collection("users").doc(this.uid);

            db.set({
                name: user.username,
                email: user.email,
                followed:{},
                follower:{},
                latitude:null,
                longitude:null,
                avatar: null
            });

            if (user.avatar) {
                remoteUri = await this.uploadPhotoAsync(user.avatar, `avatars/${this.uid}`);

                db.set({ avatar: remoteUri }, { merge: true });
            }
        } catch (error) {
            alert("Error: ", error);
        }
    };

    signIn = () =>{
        firebase.auth().signInWithEmailAndPassword(user.email, user.password).catch(function(error) {
          });
    }

    signOut = () => {
        firebase.auth().signOut();
    };

    get firestore() {
        return firebase.firestore();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get timestamp() {
        return Date.now();
    }
}

Fire.shared = new Fire();
export default Fire;
