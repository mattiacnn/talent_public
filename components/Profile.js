import React from "react";
import {
	View,
	StyleSheet,
	Image,
	Animated,
	TouchableOpacity,
	SafeAreaView,
	RefreshControl,
	ActivityIndicator,
	Modal,
} from "react-native";
import Fire from "../Fire";
import firebase from "firebase";
import "firebase/firestore";
import { ScrollView, FlatList, TextInput } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-uuid";
import { AsyncStorage, Dimensions } from "react-native";
import { YellowBox } from "react-native";
import { Video } from "expo-av";
import VideoPlayer from "expo-video-player";
YellowBox.ignoreWarnings(["VirtualizedLists should never be nested"]);
import VideoModal from "@paraboly/react-native-video-modal";
import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import userLikesVideo from "../services/Interactions";
import * as c from "../config";
import Icon2 from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Text, Button, Block, Input, Card, Radio } from "galio-framework";
import { withGlobalContext } from "../GlobalContext";
import ProgressBarAnimated from "react-native-progress-bar-animated";
import { Badge, withBadge } from "react-native-elements";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		//console.log(props);
		this.state = {
			followed: false,
			loadingIndicator: false,
			progress: 20,
			progressWithOnComplete: 0,
			progressCustomized: 0,
			status: "",
			hide: "true",
			fadeValue: 0,
			toCancel: null,
		};
	}

	componentDidMount() {
		this.setState({ followed: this.isFollowed() });
		this.checkStatus();
	}

	checkStatus = () => {
		var showUser;
		if (this.props.guest)
		{
			showUser = this.props.user;
			showUser.user_videos = this.props.userVideos;
		} else
		{
			showUser = this.props.global.user;
		}

		const like = showUser?.like_count ? showUser.like_count : "0";
		var that = this;
		//DEFINE CATEGORY STATUS
		if (like <= 5000)
		{
			that.setState({ status: "emergente" });
		} else if (like > 5000 && like <= 10000)
		{
			that.setState({ status: "talento" });
		} else if (like > 10000 && like <= 15000)
		{
			that.setState({ status: "star" });
		} else if (like > 15000)
		{
			that.setState({ status: "superstar" });
		}
	};

	increase = (key, value) => {
		this.setState({
			[key]: this.state[key] + value,
		});
	};

	isFollowed = () => {
		const userShown = this.props?.user.id || null;
		const followedList = this.props.global.user?.followed?.id_users || [];
		if (userShown)
		{
			return followedList.includes(userShown);
		} else
		{
			return false;
		}
	};

	followHandler = () => {
		this.props.follow();
		this.setState({ loadingIndicator: true });
		setTimeout(() => {
			this.setState({
				followed: !this.state.followed,
				loadingIndicator: false,
			});
		}, 500);
	};
	handleNavigation = (chatObject) => {
		console.log("chAT OBJECT:", chatObject);
		this.props.navigation.push("ChatWith", {
			chatId: chatObject.id,
			recipient: chatObject.recipient,
		});
	};

	estimateChatId(uid1, uid2) {
		if (uid1 < uid2)
		{
			return uid1 + uid2;
		} else
		{
			return uid2 + uid1;
		}
	}

	handleNewChat = (item) => {
		console.log("newchat, pressed on", item);
		var that = this;
		const idUtente = item.id;
		var gu = that.props.global.user;
		const idMio = gu._id;

		// se esiste ha questa chiave
		// const key = this.hash(idMio, idUtente);
		const chatId = this.estimateChatId(idMio, idUtente);
		const ref = firebase.firestore().collection("chats").doc(chatId);
		var arg = { id: chatId, recipient: item };

		ref
			.get()
			.then(function (doc) {
				if (doc.exists)
				{
					console.log("Document id:", doc.id);
				} else
				{
					// doc.data() will be undefined in this case
					console.log("No such document!");
					const chatItem = {
						avatars: [item.avatar, gu.avatar],
						between: [idUtente, idMio],
						users: [
							{
								name: item.name,
								surname: item.surname,
								username: item.username,
								token: item.token,
							},
							{
								name: gu.name,
								surname: gu.surname,
								username: gu.username,
								token: gu.token,
							},
						],
					};
					console.log("creating...", chatItem);
					return ref.set(chatItem);
				}
			})
			.then(() => {
				that.handleNavigation(arg);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	cancelVideo = (id) => {
		this.setState({ hide: true });
		this.setState({ toCancel: id });
	};
	deleteVideo = (idVideo) => {
		firebase.firestore().collection("videos").doc(this.state.toCancel).delete();
	};
	_rotateAnimation = () => {
		Animated.timing(this.state.fadeValue, {
			toValue: 1,
			duration: 1000,
		}).start();
	};
	disattivaCommenti = () => {
		firebase.firestore().collection("videos").doc(this.state.toCancel).update({
			commentVisible: false,
		});
	};
	render() {
		const { height, width } = Dimensions.get("window");
		const barWidth = Dimensions.get("screen").width - 150;

		const progressCustomStyles = {
			backgroundColor: "#FEBB29",
			borderRadius: 10,
			borderColor: "#FEBB29",
			height: 20,
		};

		var showUser;
		if (this.props.guest)
		{
			showUser = this.props.user;
			showUser.user_videos = this.props.userVideos;
		} else
		{
			showUser = this.props.global.user;
		}

		//console.log("showUser is"); console.log(showUser);
		let StatusIcon;
		if (this.state.loadingIndicator)
		{
			StatusIcon = <ActivityIndicator size="small" color="#00ff00" />;
		}

		return (
			<ScrollView
				contentContainerStyle={{
					alignItems: "center",
					justifyContent: "space-around",
					marginTop:10
				}}
			>
				<View style={{ flexDirection: "row" }}>
					<View style={styles.avatarContainer}>
						<TouchableOpacity
							activeOpacity={this.props.guest ? 1 : 0.5}
							onPress={this.props.guest ? () => { } : this.props.update}
						>
							<Image
								source={
									showUser.avatar
										? { uri: showUser.avatar }
										: require("../assets/tempAvatar.jpg")
								}
								style={styles.avatar}
							/>
						</TouchableOpacity>
					</View>
					
					<View style={{flex:6, display:"flex", flexDirection: "column", justifyContent:"space-evenly"}}>
						<View style={styles.bannerView}>
							<View  style={{ alignSelf:"center", flexDirection: "row" }}>
								<Icon2 name="star" color="#EE1D52" style={{}} size={18}></Icon2>
								<Icon2 name="star" color="#EE1D52" style={{}} size={18}></Icon2>
							</View>
							
							<View style={styles.banner}><Text style={styles.bannerText}>EMERGENTE</Text></View>
						</View>
						<View style={{}}><Text style={styles.nome}>{showUser?.name}{" "}{showUser?.surname}</Text></View>
						<View style={{}}><Text style={styles.bio}>La mia biografia su talent</Text></View>
					</View>
				</View>


				<View
					style={{ flexDirection: "row", justifyContent: "center", margin:10}}
				>
					{this.props.guest && (
						<>
							<View
								style={{
									margin: 10,
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								{/* segui utente */}
								<TouchableOpacity
									style={{
										margin: 5,
										flexDirection: "row",
										justifyContent: "center",
										alignItems: "center",
									}}
									onPress={this.followHandler}
								>
									<ActivityIndicator
										size="small"
										animating={this.state.loadingIndicator}
									/>
									{this.state.followed ? (
										<>
											<SimpleLineIcons
												name="user-unfollow"
												size={24}
												color="#EA1043"
											/>
											<Text
												style={{
													color: "#C3C5CD",
													fontSize: 12,
													lineHeight: 24,
													margin: 5,
												}}
											>
												Seguito
                      </Text>
										</>
									) : (
											<>
												<SimpleLineIcons
													name="user-follow"
													size={24}
													color="#EA1043"
												/>
												<Text
													style={{
														color: "#C3C5CD",
														fontSize: 12,
														lineHeight: 24,
														margin: 5,
													}}
												>
													Segui
                      </Text>
											</>
										)}
								</TouchableOpacity>
							</View>

							<View
								style={{
									margin: 5,
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<TouchableOpacity
									style={{
										margin: 5,
										flexDirection: "row",
										justifyContent: "center",
										alignItems: "center",
									}}
									onPress={() => {
										this.handleNewChat(showUser);
									}}
								>
									<Icon name="message-text" size={24} color="#EA1043" />
									<Text
										style={{
											color: "#C3C5CD",
											fontSize: 12,
											lineHeight: 24,
											margin: 5,
										}}
									>
										Messaggio
                  </Text>
								</TouchableOpacity>
							</View>
						</>
					)}
				</View>


				<View style={styles.statsContainer}>
					{/* Conteggio video */}
					<View style={styles.stat}>
						<Text style={styles.statAmount}>
							{showUser?.user_videos ? showUser.user_videos.length : "0"}
						</Text>
						<Text style={styles.statTitle}>Video</Text>
					</View>
					{/* Conteggio follower */}
					<View style={styles.stat}>
						<TouchableOpacity
							style={styles.stat}
							onPress={() => this.props.navigation.navigate("ListaSocial", { type: "followed", uid: showUser.id })}>
							<Text style={styles.statAmount}>
								{showUser?.followers_count ? showUser.followers_count : "0"}
							</Text>
							<Text style={styles.statTitle}>Follower</Text>
						</TouchableOpacity>


					</View>
					<View style={styles.stat}>
						<TouchableOpacity
							style={styles.stat}
							onPress={() => this.props.navigation.navigate("ListaSocial", { type: "follower", uid: showUser.id })}>
							<Text style={styles.statAmount}>
								{showUser?.followed_count ? showUser.followed_count : "0"}
							</Text>
							<Text style={styles.statTitle}>Seguiti</Text>
						</TouchableOpacity>

					</View>
				</View>

				{this.props.guest ? (
					<>
						<FlatList
							contentContainerStyle={styles.MainContainer}
							data={showUser?.user_videos}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.imageThumbnail}
									onPress={() =>
										this.props.navigation.navigate("Video", {
											video: item,
											owner: showUser,
										})
									}
								>
									<Image
										source={{ uri: item.thumbnail }}
										style={styles.imageThumbnail}
									></Image>
								</TouchableOpacity>
							)}
							//Setting the number of column
							numColumns={3}
							keyExtractor={(item) => item.id}
						/>
					</>
				) : (
						<>
							<FlatList
								contentContainerStyle={styles.MainContainer}
								data={showUser?.user_videos}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={styles.imageThumbnail}
										onPress={() =>
											this.props.navigation.navigate("Video", {
												video: item,
												owner: showUser,
											})
										}
										onLongPress={() => this.cancelVideo(item.id)}
									>
										<Modal
											animationType="fade"
											visible={this.state.hide}
											transparent={true}
										>
											<View
												style={{
													flex: 1,
													backgroundColor: "black",
													opacity: 0.9,
													flexDirection: "column",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<View>
													<TouchableOpacity
														style={{ margin: 10 }}
														onPress={() => this.disattivaCommenti()}
													>
														<Text
															style={{
																textAlign: "center",
																fontWeight: "500",
																fontSize: 20,
																color: "white",
															}}
														>
															Disattiva Commenti
                          </Text>
													</TouchableOpacity>
													<TouchableOpacity
														style={{ margin: 10 }}
														onPress={() => this.deleteVideo(item.id)}
													>
														<Text
															style={{
																textAlign: "center",
																fontWeight: "500",
																fontSize: 20,
																color: "white",
															}}
														>
															Cancella il video
                          </Text>
													</TouchableOpacity>
												</View>

												<TouchableOpacity
													style={{ position: "absolute", bottom: "20%" }}
													onPress={() => this.setState({ hide: false })}
												>
													<Entypo
														style={{ height: 50, width: 50, color: "white" }}
														name="cross"
														size={44}
													/>
												</TouchableOpacity>
											</View>
										</Modal>
										<Image
											source={{ uri: item.thumbnail }}
											style={styles.imageThumbnail}
										></Image>
									</TouchableOpacity>
								)}
								//Setting the number of column
								numColumns={3}
								keyExtractor={(item) => item.id}
							/>
						</>
					)}
			</ScrollView>
		);
	}
}
export default withGlobalContext(Profile);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignContent: "center",
		alignItems: "center",
	},
	logout: {
		backgroundColor: "#FF5166",
		padding: 18,
		width: "50%",
		alignSelf: "center",
		marginTop: 50,
	},
	formContainer: {
		borderBottomWidth: 1,
		borderTopWidth: 1,
		borderBottomColor: "#E4E4E4",
		borderTopColor: "#E4E4E4",
		flexDirection: "row",
		height: 370,
		paddingTop: 20,
		paddingBottom: 20,
		marginTop: 30,
	},
	column: {
		flexDirection: "column",
		width: "30%",
		justifyContent: "space-between",
		marginLeft: "5%",
	},
	column2: {
		flexDirection: "column",
		width: "65%",
		justifyContent: "space-between",
	},
	label: {
		fontWeight: "300",
		fontSize: 16,
		margin: 15,
	},
	input: {
		borderBottomWidth: 1,
		borderBottomColor: "#E4E4E4",
		margin: 15,
		fontSize: 17,
		padding: 3,
	},
	profile: {
		marginTop: 64,
		alignItems: "center",
	},
	avatarContainer: {
		flex: 4,
		overflow: "hidden",
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	},
	avatar: {
		width: 108,
		height: 108,
		borderRadius: 69,
	},
	name: {
		marginTop: 24,
		fontSize: 16,
		fontWeight: "600",
	},
	statsContainer: {
		flexDirection: "row",
		marginBottom: 20,
		maxWidth:300
	},
	stat: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	statAmount: {
		color: "#ffffff",
		fontSize: 20,
		fontWeight: "300",
	},
	modal: {
		backgroundColor: "red",
		opacity: 1.0,
	},
	button: {
		backgroundColor: "#ea1043",
		padding: 18,
		width: "50%",
		alignSelf: "center",
	},
	header: {
		flexDirection: "row",
		paddingHorizontal: 32,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#D8D9DB",
		justifyContent: "space-between",
	},
	statTitle: {
		color: "#E4E4E4",
		fontSize: 16,
		fontWeight: "300",
		marginTop: 4,
		alignSelf: "center",
		textAlign: "center",
		marginHorizontal: "auto"
	},
	MainContainer: {
		justifyContent: "center",
		alignSelf: "center",
		width: Dimensions.get("screen").width - 10,
		top: 50,
	},
	imageThumbnail: {
		height: Dimensions.get("window").width / 2,
		width: Dimensions.get("window").width / 3,
		margin:2
	},
	cover: {
		width: 300,
		height: 300,
	},
	bannerView:{
		flexDirection:"column",
		maxWidth:160
	},
	banner:{
		marginTop:4,
		backgroundColor: "transparent",
		borderRadius: 6,
		padding:3,
		flexDirection:"row",
		justifyContent:"center"
	},
	bannerText:{
		color:"#FFFFFF",
		fontSize:18,
	},
	nome:{
		color:"#FFFFFF",
		fontSize:24,
		fontWeight:"500"
	},

	bio:{
		color:"#D6D6D6",
		fontSize:16,
	}
});
