import React, { Component } from "react";
import { Text, Image, View, StyleSheet, ImageBackground, Animated } from "react-native";
import *as firebase from "firebase";
import 'firebase/firestore';


class ImageLoader  extends Component  {
  constructor(props) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
      user: []
    };
    this.onLoad= this.onLoad.bind(this);
  }

    handleSfida = () => {
      this.props.navigation.push('Carica',
      { sfida: true})
    }

    onLoad(){
      const that = this;
      Animated.timing(this.state.opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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
            user: null,
        };
    }
    onLoad = () => {
        Animated.timing(this.state.opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start( ()  => this.handleSfida());
        
      }

   async componentDidMount()
    {
        var docRef = db.collection("users").doc(firebase.auth().currentUser.uid);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                const user = doc.data().avatar     
                that.setState({user: user})        
                console.log(user)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });    
      }
    
    render() {
        return(
            <ImageBackground style={styles.container} source={require('../assets/sfida.png')}>
                <View style={styles.boxSfida}>
                    <ImageLoader
                        style={styles.sfidante}
                        source={{ uri: this.state.sfidante.avatar}}
                    />
                     <ImageLoader
                        style={styles.sfidante}
                        source={{ uri: this.state.sfidante.avatar}}
                    />
                </View>
            </ImageBackground>
        )
    }
}
const that = this;

const styles = StyleSheet.create({
    sfidante: {
        height:130,
        width:130,
        borderRadius:100,
        margin:-5,
    },
    
    boxSfida:{
        width:"100%",
        flexDirection:"row",
        justifyContent: "space-between"
    },
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }
});
