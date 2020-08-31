// upload video to firebase storage
import React, { useEffect } from 'react'

import { StatusBar } from 'react-native'

import styled from 'styled-components/native'

import Header from '../components/Header'
import Hero from '../components/Hero'
import Tabs from '../components/Tabs'

import firebase from 'firebase'

const Container = styled.View`
	flex: 1;
	background: transparent;
`

import api from '../services/api'
import { TouchableOpacity } from 'react-native-gesture-handler'



const Home = () => {
let data = []
   useEffect(() =>{
    const id = 'zfMnBHjFDLdE5gctWNvnQPDJRK42';
    firebase.firestore().collection("timelines").doc(id).collection('videos').get()
    .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            data.push(doc.data());
        });
    })
    .then(function(){            
        data = data.map(x => objToAPI(x));
        console.log('item', data);

    }
        
    );
    function objToAPI(obj) {
        const item = {
            id: obj.idVideo,
            video: obj.uriVideo,
            poster: require('../assets/poster/01.jpg'),
            user: {
                username: 'whinderssonnunes',
                description: 'Como nasceu o passinho do TikTok',
                music: 'som original',
                avatar: require('../assets/avatar/01.jpg')
            },
            count: {
                like: '1.1M',
                comment: '4080',
                share: '2800'
            }
        };

        return item;
    }
   })



    return (
        <>
            <StatusBar
                translucent
                backgroundColor='transparent'
                barStyle='light-content'
            />
            <Container>
                <Hero videos={data} />
            </Container>
        </>
    )
}

export default Home
