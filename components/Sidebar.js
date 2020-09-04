import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Share, Image, Alert, FlatList } from 'react-native';
import Modal, { ModalContent, ModalTitle, BottomModal } from 'react-native-modals';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { Item, Input } from 'native-base';
import firebase from 'firebase';
import styled from 'styled-components/native'
import { withGlobalContext } from "../GlobalContext";
import { Keyboard } from 'react-native'
import 'firebase/firestore';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
const Container = styled.View`
	width: 60px;
	height: 90%;
	padding-bottom: 59px;
	justify-content: flex-end;
`
const Menu = styled.TouchableOpacity`
	margin: 9px 0;
	align-items: center;
`
const User = styled.View`
	width: 48px;
	height: 48px;
	margin-bottom: 13px;
`
const Avatar = styled.Image`
	width: 100%;
	height: 100%;
	border-radius: 48px;
	border-width: 2px;
	border-color: #ffffff;
`
const Icon = styled.Image`
	height: 40px;
`
const Count = styled.Text`
	color: #fff;
	font-size: 12px;
	letter-spacing: -0.1px;
`

sendPushNotification = async (token) => {
	console.log("SENDING...")
	const message = {
		to: token,
		sound: 'default',
		title: `Nuovo like da: ${ this.state.name }`,
		body: 'fantastico, un nuovo like al tuo video',
		data: { data: 'goes here' },
		_displayInForeground: true,
	};
	const response = await fetch('https://exp.host/--/api/v2/push/send', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Accept-encoding': 'gzip, deflate',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(message),
	});
};

onShare = async (uri) => {
	try
	{
		const result = await Share.share({
			message: 'Ciao! guarda il video che ho messo su talent',
			url: uri,

		});

		if (result.action === Share.sharedAction)
		{
			if (result.activityType)
			{
				// shared with activity type of result.activityType
			} else
			{
				// shared
			}
		} else if (result.action === Share.dismissedAction)
		{
			// dismissed
		}
	} catch (error)
	{
		alert(error.message);
	}
};


const data = [];

const Sidebar = ({ avatarSrc, count, videoId, user, Esplora }) => {
	const [showComments, setShowComments] = useState(false);
	const [comments, setComments] = useState([]);
	const [modalCancel, setModalCancel] = useState(false);
	const [comment, setComment] = useState();
	const [commentLength, setCommentLength] = useState(0);
	const navigation = useNavigation();


	const handleSfida = () => {

		// posta video sfida
		navigation.push('StartSfida',
			{ sfida: true, utenteSfidato: user, ali: "shshzad" })
	}
	const handleModalComment = async () => {
		setShowComments(true);
		console.log(videoId)
		const commentsList = await (await firebase.firestore().collection("comments").where("video_id", "==", videoId).get()).docs.map(d => ({ id: d.id, ...d.data() }))
		setComments(commentsList)
	}

	const handleLike = (video, user, token) => {
		const uId = firebase.auth().currentUser.uid;
		const vId = video;
		var docRef;
		Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, `${ uId }${ vId }`)
			.then(hash => {
				docRef = firebase.firestore().collection("likes").doc(hash);
				return docRef.get();
			})
			.then((doc) => {
				if (doc.exists)
				{
					console.log("Document data:", doc.data());
					//this.setState({ showToast: true, message: 'Video già piaciuto' });
					console.log('già piaciuto')
				} else
				{
					docRef.set({ user_id: uId, video_id: vId, videoOwner_id: user });
					// update con transaction. Si dovrò fare con distributed counters
					firebase.firestore().collection("videos").doc(vId)
						.update({
							likes: firebase.firestore.FieldValue.increment(1)
						});
					console.log("THE TOKEN", token)
					this.sendPushNotification(token)
				}
			})
			.catch(function (error) {
				console.log("Error getting document:", error);
			});

	}

	const sendPushNotificationComment = async (token) => {
		console.log("SENDING...")
		const message = {
			to: token,
			sound: 'default',
			title: `Nuovo commento da: ${ user.username }`,
			body: 'fantastico, un nuovo commento al tuo video',
			data: { data: 'goes here' },
			_displayInForeground: false,
		};
		const response = await fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Accept-encoding': 'gzip, deflate',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});
	};

	const handleComment = async () => {
		if (showComments == false)
		{
			Alert.alert(
				"Commenti disattivati",
				"l'autore del video ha disattivato i commenti",
				[
					{ text: "OK", onPress: () => console.log("OK Pressed") }
				],
				{ cancelable: false }
			);
		}
		else
		{
			const newComment = {
				video_id: videoId,
				user_id: user.id,
				user_avatar: user.avatar || null,
				author: `${ user.username || null } ${ user.surname || null }`,
				body: comment,
				timestamp: new Date().toLocaleDateString()
			}
			Keyboard.dismiss();
			setComment("")
			await firebase.firestore().collection("comments").add(newComment);
			handleModalComment()
			sendPushNotificationComment(user.token)
			await firebase.firestore().collection("videos").doc(videoId).update({ comments: firebase.firestore.FieldValue.increment(1) })
		}
	}

	const goToUser = () => {
		navigation.push('Esplora', {
			screen: 'Utente',
			params: {
				user: user
			},
		});
	}

	return (
		<Container >
			<Menu onPress={goToUser}>
				<User key={videoId}>
					<Avatar resizeMode='cover' source={{ uri: avatarSrc }} />
				</User>
			</Menu>

			<Menu onPress={() => this.handleLike(videoId, user.id, user.token)}>
				<Icon resizeMode='contain' source={require('../assets/icons/like.png')} />
				<Count>{count.like}</Count>
			</Menu>

			<Menu onPress={handleSfida}>
				<FontAwesome name="flash" color="white" size={40} />
			</Menu>
			<Menu onPress={handleModalComment}>
				<Icon
					resizeMode='contain'
					source={require('../assets/icons/comment.png')}
				/>
				<Count>{count.comment}</Count>
			</Menu>

			<Menu onPress={() => onShare()}>
				<Icon resizeMode='contain' source={require('../assets/icons/share.png')} />
			</Menu>

			<BottomModal

				visible={showComments}
				onTouchOutside={() => setShowComments(false)}
				height={0.8}
				width={1}
				onSwipeOut={() => setShowComments(false)}
				swipeDirection={['up', 'down']} // can be string or an array
				swipeThreshold={200}
				modalTitle={
					<ModalTitle
						title="Commenti"
						hasTitleBar
					/>
				}
			>
				<KeyboardAwareScrollView
					resetScrollToCoords={{ x: 0, y: 0 }}
					contentContainerStyle={styles.container}
					scrollEnabled={true}
				>
					<ModalContent
						style={{
							flex: 1,
							backgroundColor: 'fff',
						}}
					>
						<FlatList
							numColumns={1}
							data={comments}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity style={{ flexDirection: "row", marginTop: 10 }} onLongPress={() => setModalCancel(true)}>
									<Modal
										animationType="fade"
										visible={modalCancel}
									>
										<View style={{ height: 100, width: 250, backgroundColor: "white", justifyContent: "center" }}>
											<TouchableOpacity style={{ margin: 5 }} onPress={() => setModalCancel(false)}>
												<Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Annulla</Text>
											</TouchableOpacity>
											<TouchableOpacity style={{ margin: 5 }} onPress={() => this.deleteComment(item.id)}>
												<Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Cancella Commento</Text>
											</TouchableOpacity>
											<TouchableOpacity style={{ margin: 5 }}>
												<Text style={{ textAlign: "center", fontWeight: '500', fontSize: 16, color: "black" }}>Segnala</Text>
											</TouchableOpacity>

										</View>
									</Modal>
									<Image style={{ height: 40, width: 40, borderRadius: 30 }} source={{ uri: item.user_avatar }} />
									<View style={{ flexDirection: "column", marginLeft: 30 }}>
										<View style={{ flexDirection: "row" }}>
											<Text style={{ fontWeight: "bold" }}>{item.author}</Text>
											<Text style={{ marginLeft: 10 }}>{item.body}</Text>
										</View>
										<Text style={{ fontSize: 12, color: "gray" }}>{item.timestamp}</Text>
									</View>
								</TouchableOpacity>
							)}
						>
						</FlatList>
						<Item rounded style={{ flexDirection: "row", justifyContent: "space-around", marginHorizontal: 5, padding: 5 }}>
							<Input placeholder='Inserisci commento' value={comment} onChangeText={setComment} />
							<TouchableOpacity style={{ marginHorizontal: 5, marginRight: 15, padding: 10 }} onPress={handleComment}>
								<Text style={{ fontWeight: "bold" }}>Pubblica</Text>
							</TouchableOpacity>

						</Item>
					</ModalContent>
				</KeyboardAwareScrollView>

			</BottomModal>
		</Container>
	)
}
const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	full: {
		flex: 1,
		flexDirection: 'row'
	},
	rightside: {
		flex: 1,
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		margin: 8
	},
	leftside: {
		alignItems: 'flex-start'
	},
	rightcontent: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	likecount: {
		color: 'white',
		marginLeft: 5,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8
	},
	commentcount: {
		color: 'white',
		marginLeft: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8
	},
	share: {
		color: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tagtitle: {

		padding: 10,
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold'

	},
	tag: {
		backgroundColor: 'transparent',
		margin: 10,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 8,
		marginTop: 100
	},
	username: {
		fontWeight: 'bold',
		color: 'white',
		marginLeft: 16
	},
	commentsBottom: {
		color: 'white',
		marginLeft: 8
	},
	userimage: {
		width: 40,
		height: 40,
		borderRadius: 40 / 2
	}


});

export default withGlobalContext(Sidebar)
