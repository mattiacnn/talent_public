'use strict';
import {Dimensions} from 'react-native';
var React = require('react-native');

var {
    StyleSheet,
} = React;

// colore principale
var mainRed = '#ea5159';

var coloreInput = '#161f3d';

module.exports = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor:"white"
    },
    greeting: {
        top: 40,
        fontSize: 24,
        fontWeight: '400',
        textAlign: 'center',
        position:"absolute",
        alignSelf:"center",
        color:"white"
    },
    form: {
        paddingTop:220,
        paddingHorizontal: 40,
        height:Dimensions.get('window').height,
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-around"
    },
    formItem:{
        flex:1,
        width:"100%"
    },
    inputTitle: {
        fontSize: 10,
        textTransform: 'uppercase'
    },
    input: {
        borderBottomColor: '#8a8f9e',
        borderBottomWidth: StyleSheet.hairlineWidth,
        fontSize: 15,
    },
    button: {
        marginHorizontal: 40,
        backgroundColor: mainRed,
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorMessage: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },

    error: {
        color: '#e9446a',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    },
    back: {
        position: 'absolute',
        top: 48,
        left: 32,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(21, 22, 48, 0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#cccccc',
        borderRadius: 50,
        marginTop: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50
    }
});