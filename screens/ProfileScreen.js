import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import *as firebase from "firebase";

export default class ProfileScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Profile Screen</Text>
                <Button title="Esci" onPress={this.signOut}></Button>
            </View>
        );
    }

    signOut = () => {
        firebase.auth().signOut();
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});
