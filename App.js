// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import AsyncStore from '@react-native-community/async-storage';
import { StyleSheet, Text, TextInput, Button, View, YellowBox } from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore'
import AsyncStorage from '@react-native-community/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCdlC4P6eCxEWY29xH5cKHeXnUyi5mKLhA",
  authDomain: "react-native-chat-3293b.firebaseapp.com",
  projectId: "react-native-chat-3293b",
  storageBucket: "react-native-chat-3293b.appspot.com",
  messagingSenderId: "12174607381",
  appId: "1:12174607381:web:de2d839d203207f680ba1c"
}

if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()

const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot.docChanges().filter(({type}) => type == 'added').map(({doc}) => {
        const message = doc.data()
        return { ...message, createdAt: message.createdAt.toDate()}
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() )
      appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }
  }

  async function handlePress() {
    const id = Math.random().toString(36).substring(7) //should be userid
    const user = {id, name}
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  if(!user) {
    return <View style={styles.container}>
      <TextInput style={styles.input} paceholder="Enter your name" value={name} onChangeText={setName} />
      <Button onPress={handlePress} title="Enter the chat" />
      </View>
  }

  return (
      <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 10,
    borderColor: 'gray',
  }
});
