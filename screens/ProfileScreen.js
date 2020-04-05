import React from "react";
import { View, Text, StyleSheet, Button, Image,TouchableOpacity } from "react-native";
import Fire from "../Fire";
import firebase from 'firebase';
import 'firebase/firestore';
import { ScrollView } from "react-native-gesture-handler";

export default class ProfileScreen extends React.Component {
    state = {
        user: {name:"",surname:"",followed:{}}
    };

    unsubscribe = null;
    
    componentDidMount() {
        this.getUserData()
    }

    componentWillUnmount() {
    }

    getUserData = () =>{
        let id = firebase.auth().currentUser.uid;
        firebase.firestore().collection("users").doc(id).get()
        .then(doc => {
            if (!doc.exists) {
            console.log('No such document!');
            } else {
            console.log('Document data:', doc.data());
            this.setState({user:{name: doc.data().name, surname: doc.data().surname, followed: doc.data().followed}})
            //var followedNum = doc.data().followed.length;
        }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

    }
    render() {
        return (
            <ScrollView>
           <View style={styles.container}>
                <View style={{ marginTop: 64, alignItems: "center" }}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                this.state.user.avatar
                                    ? { uri: this.state.user.avatar }
                                    : require("../assets/tempAvatar.jpg")
                            }
                            style={styles.avatar}
                        />
                    </View>
                    <View style={{flexDirection:"row",}}>
                        <Text style={styles.name}>{this.state.user.name} </Text>
                        <Text style={styles.name}>{this.state.user.surname}</Text>
                    </View>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>21</Text>
                        <Text style={styles.statTitle}>Posts</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>981</Text>
                        <Text style={styles.statTitle}>Followers</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statAmount}>{this.state.user.followed? this.state.user.followed.length : "--"}</Text>
                        <Text style={styles.statTitle}>Following</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => this.loginUser(this.state.email, this.state.password)}>
                    <View style={{display:"flex", flexDirection:"row",alignItems:"stretch",justifyContent:"space-around", }}>
                        <Text style={{ color: "#FFF", fontWeight: "500",letterSpacing:2,alignSelf:"center",fontSize:12,marginTop:-3 }}>Modifica Profilo</Text>
                    </View>
                </TouchableOpacity>
                <Button
                    onPress={() => {
                        Fire.shared.signOut();
                    }}
                    title="Log out"
                />
            </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    profile: {
        marginTop: 64,
        alignItems: "center"
    },
    avatarContainer: {
        shadowColor: "#151734",
        shadowRadius: 30,
        shadowOpacity: 0.4
    },
    avatar: {
        width: 136,
        height: 136,
        borderRadius: 68
    },
    name: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: "600"
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 32
    },
    stat: {
        alignItems: "center",
        flex: 1
    },
    statAmount: {
        color: "#4F566D",
        fontSize: 18,
        fontWeight: "300"
    },
    button: {
        backgroundColor: "#FF5166",
        padding: 18,
        width:"40%",    
        alignSelf:"center"    
    },
    statTitle: {
        color: "#C3C5CD",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    }
});
