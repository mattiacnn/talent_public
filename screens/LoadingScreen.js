import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import firebase from "firebase";
import LoginScreen from "./LoginScreen";

class LoadingScreen extends React.Component {

    componentDidMount() {
        this.checkIfLoggedIn();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                this.props.navigation.navigate('Home');
            }
            else {
                this.props.navigation.navigate('Login');
            }
        }.bind(this)
        );
    };


    render() {
        return (
            <View style={styles.container}>
                <Text>Caricamento</Text>
                <ActivityIndicator size="large"></ActivityIndicator>
            </View>
        );
    }
} export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});
