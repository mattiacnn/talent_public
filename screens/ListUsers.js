import RisultatiRicerca from "../components/RisultatiRicerca";
import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  TextInput,
} from "react-native";
import * as firebase from "firebase";
import "firebase/firestore";
import { Entypo } from "@expo/vector-icons";
import { withGlobalContext } from "../GlobalContext";

class ListUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      followed: [],
    };
  }

  componentDidMount() {
    let type = this.props.route.params.type || null;
    let uid = this.props.route.params.uid;
    this.getUsersFollowing(type, uid);
  }

  getUsersFollowing = async (type = "follower", uid) => {
    var that = this;
    const myId = uid || this.props.global.user._id;
    var fullFollowedList = [];

    firebase
      .firestore()
      .collection("following")
      .where(type, "==", myId)
      .get()
      .then(function (querySnapshot) {
        var followed = [];
        querySnapshot.forEach(function (doc) {
          let user = doc.data();
          user.id = doc.id;
          followed.push(user);
        });
        console.info("Found these followed: ");
        console.log(followed);
        return followed;
      })
      .then((followed) => {
        const who = type == "follower" ? "followed" : "follower";
        let followedList = followed.map((i) => i[who]);
        let promises = [];

        followedList.forEach((id) => {
          const p = firebase.firestore().collection("users").doc(id).get();
          promises.push(p);
        });

        Promise.all(promises).then(function (docs) {
          var users = [];
          docs.forEach((user) => {
            users.push({
              id: user.id,
              ...user.data(),
            });
          });
          console.log("Full Followed list");
          console.log(users);
          that.setState({ followed: users });
        });
      });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <RisultatiRicerca
          usersFound={this.state.followed}
          navigation={this.props.navigation}
        />
      </SafeAreaView>
    );
  }
}

export default withGlobalContext(ListUsers);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#0f0104",
  },
});
