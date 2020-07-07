import React from "react";
import { Alert, View, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, FlatList, TextInput } from 'react-native';
import *as firebase from "firebase";
import 'firebase/firestore';
import { Entypo } from "@expo/vector-icons";
import { Right } from "native-base";
import { withGlobalContext } from "../GlobalContext";
import { Text } from 'galio-framework';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';
import Collapsible from 'react-native-collapsible';
import { ActivityIndicator } from "react-native-paper";
import Icon2 from 'react-native-vector-icons/MaterialIcons';

const chats = [
    {
        id: 1, username: "Mattiacnn", text: "ciao come stai?", chatId: "1"
    },
    {
        id: 2, username: "Flaviocnn", text: "ciao come stai?"
    },
    {
        id: 3, username: "Carlo23", text: "ciao come stai?"
    },
    {
        id: 4, username: "Melo86", text: "ciao come stai?"
    },
    {
        id: 5, username: "GiuliaSpa", text: "ciao come stai?"
    },
    {
        id: 6, username: "GabryTeletabies", text: "ciao come stai?"
    },

]


const BACON_IPSUM =
    'Bacon ipsum dolor amet chuck turducken landjaeger tongue spare ribs. Picanha beef prosciutto meatball turkey shoulder shank salami cupim doner jowl pork belly cow. Chicken shankle rump swine tail frankfurter meatloaf ground round flank ham hock tongue shank andouille boudin brisket. ';

const CONTENT = [
    {
        title: 'First',
        content: BACON_IPSUM,
    },
    {
        title: 'Second',
        content: BACON_IPSUM,
    },
    {
        title: 'Third',
        content: BACON_IPSUM,
    },
    {
        title: 'Fourth',
        content: BACON_IPSUM,
    },
    {
        title: 'Fifth',
        content: BACON_IPSUM,
    },
];
class SfideScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            usersFound: {},
            isImageAvailable: false,
            visible: false,
            profilePic: null,
            dataSource: [],
            selectedVideo: null,
            searchString: "",
            query: "",
            search: "",
            sfideLanciate: [],
            sfideRicevute: [],
            activeRSections: [],
            collapsed: true,

        };
    }

    componentDidMount() {
        this.refreshData();
    }

    toggleExpanded = () => {
        this.setState({ collapsed: !this.state.collapsed });
    };

    refreshData = () => {
        const id = this.props.global.user.id;
        var sfideLanciate = [];
        var sfideRicevute = [];

        firebase.firestore().collection('sfide')
            .where('sfidante_id', '==', id).get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    //console.log(doc.id, " => ", doc.data());
                    sfideRicevute.push({ ...doc.data(), id: doc.id, content: 'Hai sfidato' });
                });
            })
            .then(() => (firebase.firestore().collection('sfide').where('sfidato_id', '==', id).get()))
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    //console.log(doc.id, " => ", doc.data());
                    sfideRicevute.push({ ...doc.data(), id: doc.id, content: 'Ti ha sfidato' });
                });
            })
            .then(() => (this.setState({ sfideRicevute })))
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });

    }

    async fetchUser(user) {
        return firebase.firestore().collection('users').doc(user).get();
    }

    handleNaviagtion = (id) => {
        console.log('video id ', id);
        var video;
        var owner;

        firebase.firestore().collection('videos').doc(id).get()
            .then(doc => {
                video = doc.data();
                return firebase.firestore().collection('users').doc(video.owner).get()
            })
            .then(doc => {
                this.setState({show:false});
                owner = doc.data();
                this.props.navigation.navigate('Video', { video, owner })
            })
            .catch(err => { console.log(err) });
    }

    statusLabel(status) {
        var statusMessage;
        switch (status) {
            case 'onCreating':
                statusMessage = "In attesa";
                break;

            case 'refused':
                statusMessage = "Rifiutata";
                break;

            case 'pending':
                statusMessage = "In corso";
                break;

            case 'completed':
                statusMessage = "Completata";
                break;

            default:
                statusMessage = "Scaduta";
                break;
        }
        return (
            <View style={{
                height: 28,
                width: 80,
                fontSize: 20,
                lineHeight: 28,
                backgroundColor: "white",
                borderRadius: 14,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: 10
            }}>
                <Text style={{ color: "#EA1043" }}>{statusMessage}</Text>
            </View>
        )
    }

    accettaSfida = (sfida) =>{
        console.log('sfida: ', sfida);
        delete sfida.content;
        this.props.navigation.push('Carica',
            { rispostaSfida: sfida})
    }

    statusAlert = (item) => {
        var title;
        var neutral;
        var negative;
        var positive;

        switch (item.status) {
            case 'onCreating':
                // la sfida è stata appena creata e dev'essere accettata dallo sfidato
                if (item.sfidato_id == this.props.global.user.id) {
                    // l'utente corrente è quello che dev'essere sfidato P N N
                    title = 'Rispondi a questa sfida';
                    positive = { text: 'Accetta la sfida', onPress: () => this.accettaSfida(item) };
                    negative = { text: 'Rifiuta', onPress: () => console.log('rifiuta') };
                    neutral = { text: 'Rispondi più tardi', onPress: () => console.log('dopo') };
                } else {
                    // la sfida dev'essere accettata dall'altro utente P N
                    title = 'La sfida che hai lanciato è in attesa di risposta';
                    positive = { text: 'Ok', onPress: () => console.log('OK Pressed') };
                    negative = { text: 'Annulla la sfida', onPress: () => console.log('annulla') };
                }
                break;

            case 'refused':
                // l'utente sfidato ha rifiutato la sfida P
                title = 'Questa sfida è stata rifiutata';
                positive = { text: 'Ok', onPress: () => console.log('OK Pressed') };
                break;

            case 'pending':
                // l'utente sfidato ha accettato la sfida P
                title = 'Questa sfida è in corso';
                positive = { text: 'Guarda il tuo video', onPress: () => console.log('OK Pressed') };
                break;

            case 'completed':
                // P
                title = 'Questa sfida si è conclusa';
                positive = { text: 'Ok', onPress: () => console.log('OK Pressed') };
                break;

            default:
                // P
                title = 'Questa è sfida è scaduta';
                positive = { text: 'Ok', onPress: () => console.log('OK Pressed') };
                break;
        }

        let buttons = [];
        neutral && buttons.push(neutral)
        negative && buttons.push(negative);
        buttons.push(positive);
        return Alert.alert(
            'Sfida',
            title,
            buttons,
            { cancelable: true },
        );
    }

    setSections = sections => {
        this.setState({
            activeRSections: sections.includes(undefined) ? [] : sections,
        });
    };

    _renderSectionTitle = section => {
        return (
          <View style={{marginVertical:10}}>
            <Text color="white">{section.content}</Text>
          </View>
        );
      };

    renderHeader = (item, _, isActive) => {
        return (
            <View style={styles.cardSfida}>
                <Text color="white">{item.content}</Text>
                <View style={styles.nome_status}>
                    <Text style={styles.name}>{item?.sfidato?.name} </Text>
                    {this.statusLabel(item.status)}
                </View>
                
                <View style={styles.star}>
                    <Text style={styles.message}>{item?.threshold} </Text> 
                    <Icon2 name="star" size={20} color="white" />
                </View>
                
                
            </View>

        );
    };

    renderContent = (section, _, isActive) => {
        // dove si trova il mio video?
        // se è una sfida inviata è il video1, altrimenti è il video 2
        const video_id = (section.content == 'inviate') ? section.video1_id : section?.video2_id;
        return (
            <View style={{ padding: 10, margin: 10, backgroundColor: "#2b2b2b", justifyContent: "space-evenly" }}>
                <TouchableOpacity onPress={() => {
                                //console.log(item);
                                this.statusAlert(section);
                            }}>
                    <Text p color="#FF1E56">Opzioni</Text>
                </TouchableOpacity>
                <Text color="white" p>
                    creata il: {section.createdAt.toDate().toLocaleDateString()}
                </Text>
                {video_id && (<TouchableOpacity onPress={() => { this.setState({ show: true }); this.handleNaviagtion(video_id) }}>
                    {this.state?.show ? (<ActivityIndicator size="small" color="#00ff00" />) : (<Text color="red" p>Vai al tuo video</Text>)}
                </TouchableOpacity>)}
            </View>
        );
    }

    render() {
        //console.log('fullchats', this.state.fullChats);
        const { search, activeRSections } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                {/* <FlatList
                    data={this.state.sfideLanciate}
                    renderItem={({ item }) => {

                        return (
                            <TouchableOpacity style={styles.row} onPress={() => {
                                //console.log(item);
                                this.statusAlert(item);
                            }}>

                                <View style={styles.column}>
                                    <Text style={styles.name}>
                                        {item?.sfidato?.name}
                                    </Text>
                                    <Text style={styles.message}>
                                        Star richieste: {item?.threshold}
                                    </Text>
                                </View>
                                {this.statusLabel(item.status)}
                            </TouchableOpacity>)
                    }}
                    keyExtractor={(item) => item.id.toString()}
                /> */}

                {/* <FlatList
                    data={this.state.sfideRicevute}
                    renderItem={({ item }) => {

                        return (
                            <TouchableOpacity style={styles.row} onPress={() => {
                                //console.log(item);
                                this.statusAlert(item);
                            }}>

                                <View style={styles.column}>
                                    <Text style={styles.name}>
                                        {item?.sfidante?.name}
                                    </Text>
                                    <Text style={styles.message}>
                                        Star richieste: {item?.threshold}
                                    </Text>
                                </View>
                                {this.statusLabel(item.status)}
                            </TouchableOpacity>)
                    }}
                    keyExtractor={(item) => item.id.toString()}
                /> */}
                <Accordion
                    activeSections={activeRSections}
                    sections={this.state.sfideRicevute}
                    touchableComponent={TouchableOpacity}
                    renderHeader={this.renderHeader}
                    renderContent={this.renderContent}
                    // renderSectionTitle={this._renderSectionTitle}
                    onChange={this.setSections}
                />
            </SafeAreaView>
        )
    }

}

export default withGlobalContext(SfideScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
    },
    row: {
        height: 80,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    cardSfida:  {
        paddingHorizontal:15,
        margin:10,
        padding:10,
        flexDirection: "column",
        backgroundColor:"#FF1E56",
        borderRadius: 12
    },
    nome_status: {
        flexDirection:"row",
        alignItems:"center"
    },
    star: {
        flexDirection:"row",
        alignItems:"center"
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 68,
        marginLeft: 10
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff"
    },
    message: {
        fontSize: 20,
        color: "#fff",
    },
    searchSection: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#0f0104',
    },
    searchIcon: {
        padding: 10,
        marginLeft: 20,
        backgroundColor: '#1C1C1C',

    },
    circle: {
        padding: 10,
        marginRight: 20,
        alignSelf: "flex-end"
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        height: 48,
        backgroundColor: '#1C1C1C',
        color: 'white',
        marginRight: 10
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: 25,
        alignSelf: "center",
        padding: 10,
    },
    title: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '300',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#F5FCFF',
        padding: 10,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        padding: 20,
        backgroundColor: '#fff',
    },
    active: {
        backgroundColor: 'rgba(255,255,255,1)',
    },
    inactive: {
        backgroundColor: 'rgba(245,252,255,1)',
    },
    selectors: {
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    selector: {
        backgroundColor: '#F5FCFF',
        padding: 10,
    },
    activeSelector: {
        fontWeight: 'bold',
    },
    selectTitle: {
        fontSize: 14,
        fontWeight: '500',
        padding: 10,
    }


})
