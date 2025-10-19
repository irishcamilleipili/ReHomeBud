import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { useLocalSearchParams } from "expo-router";

export default function ChatScreen() {
  const { recipientId, recipientContact } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const flatListRef = useRef(null);

  const currentUser = auth.currentUser;
  const chatId =
    currentUser?.uid < recipientId
      ? `${currentUser?.uid}_${recipientId}`
      : `${recipientId}_${currentUser?.uid}`;

  useEffect(() => {
    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");

    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const chatRef = doc(db, "chats", chatId);
    const messagesRef = collection(chatRef, "messages");

    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.uid, recipientId],
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      text,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <Text style={styles.header}>Chat with {recipientContact}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === currentUser.uid
                ? styles.myMessage
                : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC",
    paddingTop: 50,
  },
  header: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#3D211A",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#CBB799",
    backgroundColor: "#EDE7D0",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    color: "#3D211A",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#A07856",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 4,
    marginHorizontal: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#A07856",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#CBB799",
  },
  messageText: {
    color: "#fff",
  },
});
