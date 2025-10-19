// 🐾 Home.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import NavigationBar from "../components/NavigationBar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [messageText, setMessageText] = useState("");

  const [newPost, setNewPost] = useState({
    image: null,
    description: "",
    location: "",
    contact: "",
    type: "Lost",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, "lostFound"), orderBy("createdAt", "desc"))
      );
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewPost({
        ...newPost,
        image: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const handleAddOrEdit = async () => {
    const { image, description, location, contact, type } = newPost;
    if (!image || !description || !location || !contact) {
      Alert.alert("Missing Info", "Please fill in all fields and select an image.");
      return;
    }

    try {
      if (editMode && selectedPost) {
        const postRef = doc(db, "lostFound", selectedPost.id);
        await updateDoc(postRef, { image, description, location, contact, type });
        Alert.alert("Updated", "Post updated successfully!");
      } else {
        await addDoc(collection(db, "lostFound"), {
          userId: auth.currentUser?.uid,
          image,
          description,
          location,
          contact,
          type,
          createdAt: new Date(),
        });
        Alert.alert("Posted", "Your lost/found report has been added!");
      }
      setModalVisible(false);
      setNewPost({ image: null, description: "", location: "", contact: "", type: "Lost" });
      setEditMode(false);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "lostFound", id));
            fetchPosts();
            Alert.alert("Deleted", "Post removed successfully!");
          } catch (error) {
            console.error("Error deleting:", error);
          }
        },
      },
    ]);
  };

  const handleEdit = (post) => {
    setEditMode(true);
    setSelectedPost(post);
    setNewPost({
      image: post.image,
      description: post.description,
      location: post.location,
      contact: post.contact,
      type: post.type,
    });
    setModalVisible(true);
  };

  const handleMessage = (post) => {
    setSelectedPost(post);
    setMessageModal(true);
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    Alert.alert("Message Sent", `Message sent to ${selectedPost.contact}: ${messageText}`);
    setMessageText("");
    setMessageModal(false);
  };

  const toggleType = () => {
    setNewPost({ ...newPost, type: newPost.type === "Lost" ? "Found" : "Lost" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost & Found Hub</Text>
      <NavigationBar />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModalVisible(true);
          setEditMode(false);
          setNewPost({ image: null, description: "", location: "", contact: "", type: "Lost" });
        }}
      >
        <Text style={styles.addButtonText}>+ Post Lost/Found</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#4D403A" style={{ marginTop: 20 }} />
      ) : posts.length === 0 ? (
        <Text style={styles.emptyText}>No posts yet.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
              <View style={styles.postContent}>
                <Text
                  style={[
                    styles.postType,
                    { color: item.type === "Lost" ? "#ac3a15ff" : "#41720fff" },
                  ]}
                >
                  {item.type.toUpperCase()}
                </Text>
                <Text style={styles.postDescription}>{item.description}</Text>
                <Text style={styles.postDetails}>📍 {item.location}</Text>
                <Text style={styles.postDetails}>📞 {item.contact}</Text>

                <View style={styles.buttonRow}>
                  {item.userId === auth.currentUser?.uid && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#A3968D" }]}
                        onPress={() => handleEdit(item)}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#4D403A" }]}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#262626" }]}
                    onPress={() => handleMessage(item)}
                  >
                    <Text style={styles.buttonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* 🪶 Modal for Add/Edit */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Lost/Found Post" : "Add Lost/Found Post"}
            </Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {newPost.image ? (
                <Image source={{ uri: newPost.image }} style={styles.previewImage} />
              ) : (
                <Text style={{ color: "#A3968D" }}>Tap to select image</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newPost.description}
              onChangeText={(t) => setNewPost({ ...newPost, description: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newPost.location}
              onChangeText={(t) => setNewPost({ ...newPost, location: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={newPost.contact}
              onChangeText={(t) => setNewPost({ ...newPost, contact: t })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.toggleButton, newPost.type === "Lost" ? styles.lostMode : styles.foundMode]}
              onPress={toggleType}
            >
              <Text style={styles.toggleText}>
                {newPost.type === "Lost"
                  ? "Currently: LOST (Tap to change → FOUND)"
                  : "Currently: FOUND (Tap to change → LOST)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={handleAddOrEdit}>
              <Text style={styles.addButtonText}>{editMode ? "Update" : "Submit"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "#4D403A" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.addButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {/* 📨 Message Modal */}
      <Modal visible={messageModal} animationType="slide" transparent>
        <View style={styles.messageModalContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.modalTitle}>Message Owner</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="Type your message here..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.addButton, { marginBottom: 10 }]}
              onPress={sendMessage}
            >
              <Text style={styles.addButtonText}>Send Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "#4D403A" }]}
              onPress={() => setMessageModal(false)}
            >
              <Text style={styles.addButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5", // Pearl
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: "#4D403A", // Cacao
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  addButton: {
    backgroundColor: "#A3968D", // Taupe
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DFDACF", // Khaki
    shadowColor: "#262626", // Leather
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 180,
  },
  postContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postType: {
    fontSize: 16,
    color: "#4D403A",
    fontFamily: "Poppins_600SemiBold",
  },
  postDescription: {
    color: "#4D403A",
    marginVertical: 4,
    fontFamily: "Poppins_400Regular",
  },
  postDetails: {
    color: "#A3968D",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAF8F5", // Pearl
  },
  modalInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    margin: 16,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
    shadowColor: "#262626",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    color: "#4D403A",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DFDACF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FAF8F5",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DFDACF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    color: "#262626",
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  toggleButton: {
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  lostMode: { backgroundColor: "#A3968D" },
  foundMode: { backgroundColor: "#4D403A" },
  toggleText: { 
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  messageModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  messageBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "85%",
  },
});
