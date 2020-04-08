import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SearchBar, ButtonGroup } from 'react-native-elements'

export default class SearchScreen extends React.Component {

    state = {
        search: '',
      };

    static navigationOptions = {
        headerShown: false
    };

    updateSearch = search => {
        this.setState({ search });
      };

    render() {
        const { search } = this.state;
        return (
            <View style={styles.container}>
                <SearchBar
                lightTheme
                onChangeText={this.updateSearch}
                value={search}
                containerStyle = {{width:"100%",backgroundColor:"#EEEEEE",height:100,paddingTop:30}}
                round
                placeholder='Type Here...' />
             </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start"
    }
});
