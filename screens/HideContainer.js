import React from 'react';
import { View, Image, Text, StyleSheet,FlatList,Dimensions,TouchableOpacity,SafeAreaView } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import PropTypes from 'prop-types';
import { Entypo } from "@expo/vector-icons";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';


const HideContainer = (props) => {

    state = {
        user: {},
        usersFound:{},
        isImageAvailable: false,
        visible: false,
        profilePic: null,
        dataSource: [],
        selectedVideo: null,
        searchString:"",
        query:"",
        search:"",
        selectedItems: [],
        hide:false
    };

  const { children, hide, style } = props;
  const { search } = this.state;
 
  if (hide == true)  {

    return(
    <SafeAreaView>
      <View style={styles.searchSection}>
          <Entypo name="magnifying-glass" size={24} color="white" style={styles.searchIcon} />
          <TextInput
              style={styles.input}
              placeholder="Cerca Per Nickname"
              value={search}
              onEndEditing={this.searchFromDb}                           
              onChangeText={this.updateSearch}
              underlineColorAndroid="transparent"
              autoFocus={true} 
          />
            <TouchableOpacity onPress={ () => {this.props}}>
                  <Text style={{color:"white",padding:15}}>Anulla</Text>
            </TouchableOpacity>
      </View>
      <FlatList
          data={this.state.usersFound}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchSection} onPress={() => {
                            //console.log(item);
                 this.props.navigation.push('Esplora', {
                      screen: 'Utente',
                       params: {
                           user:item
                            },
                          });
                        }}>
                        <Image style={styles.roundedAvatar} source={item.avatar?  { uri: item.avatar }
                             : require("../assets/tempAvatar.jpg")
                           } ></Image>
                            <Text style={{fontWeight:"bold",paddingLeft:20}}>{item.username}</Text>   
                        </TouchableOpacity>

                     )}
                            numColumns={1}
                            keyExtractor={(item) => item.email}
                      />
    </SafeAreaView>
    )
}

  return (
    <View {...this.props} style={style}>
      { children }
    </View>
  );
};

HideContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.element,
    ])),
  ]).isRequired,
  hide: PropTypes.bool,
  hideManually: PropTypes.func

};

export default HideContainer;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor:"#0f0104",
    

  },
  roundedAvatar:{
      width:45,
      height:45,
      borderRadius:30,
      marginLeft:20
  },

  
 
      searchSection: {
          height:60,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width:"95%",
          backgroundColor:"#1C1C1C",
          margin:10

      },
      searchIcon: {
          padding: 10,

      },
      input: {
          flex: 1,
          paddingTop: 10,
          paddingRight: 10,
          paddingBottom: 10,
          paddingLeft: 0,
          height:48,
          marginRight:10,
          color:"#8a8f9e",
          backgroundColor:"#1C1C1C",

      },
  row:{
      flexDirection:"row",
      justifyContent:"space-around"
  }
});