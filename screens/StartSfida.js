import React, { Component } from "react";
import { Text, Image, View, StyleSheet, ImageBackground, Animated } from "react-native";
import * as firebase from "firebase";
import 'firebase/firestore';

const bgImage = require('../assets/sfida.png');

class ImageLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
      user: []
    };
    this.onLoad = this.onLoad.bind(this);
  }

  handleSfida = () => {
    if (this.props.navigation)
    {
      this.props.navigation.navigate('Carica',
        { sfida: true, utenteSfidato: this.props.user })
    }

  }

  onLoad = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => this.handleSfida());

  }

  render() {
    return (
      <Animated.Image
        onLoad={this.onLoad}
        {...this.props}
        style={[
          {
            opacity: this.state.opacity,
            transform: [
              {
                scale: this.state.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                })
              },
            ],
          },
          this.props.style,
        ]}
      />
    );
  }
}

export default class StarSfida extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sfidante: this.props.route.params.utenteSfidato,
      userAvatar: null,

    };
  }



  async componentDidMount() {
    const uid = firebase.auth().currentUser.uid;
    console.log("uid---->:", uid)
    var docRef = db.collection("users").doc(uid);
    var that = this;
    docRef.get().then(function (doc) {
      if (doc.exists)
      {
        const avatar = doc.data().avatar
        that.setState({ userAvatar: avatar })
      } else
      {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }

  render() {
    return (
      <ImageBackground style={styles.container} source={bgImage}>
        <View style={styles.boxSfida}>
          <ImageLoader
            style={styles.sfidante}
            source={{ uri: this.state.sfidante.avatar }}
            navigation={this.props.navigation}
            user={this.props.route.params?.utenteSfidato}
          />
          {this.state.userAvatar && <ImageLoader
            style={styles.sfidante}
            source={{ uri: this.state.userAvatar }}
          />}
        </View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  sfidante: {
    height: 130,
    width: 130,
    borderRadius: 100,
    margin: -5,
  },

  boxSfida: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
