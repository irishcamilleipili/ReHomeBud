import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import NavigationBar from "../components/NavigationBar";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    photo: "",
    bio: "",
    contact: "",
  });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: currentUser.displayName || data.name || "",
            photo: currentUser.photoURL || data.photo || "",
            bio: data.bio || "",
            contact: data.contact || "",
          });
        } else {
          await setDoc(userRef, { name: "", photo: "", bio: "", contact: "" });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const notesRef = collection(db, "notes", user.uid, "userNotes");
    const q = query(notesRef, orderBy("createdAt", sortNewest ? "desc" : "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        await addDoc(notesRef, { text: "Welcome to your notes!", createdAt: new Date() });
      } else {
        setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });

    return unsubscribe;
  }, [user, sortNewest]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setTempProfile((prev) => ({ ...prev, photo: uri }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      let updatedProfile = { ...tempProfile };

      if (tempProfile.photo && tempProfile.photo !== profile.photo) {
        const storage = getStorage();
        const blob = await (await fetch(tempProfile.photo)).blob();
        const storageRef = ref(storage, `profilePhotos/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        const photoURL = await getDownloadURL(storageRef);
        updatedProfile.photo = photoURL;
        await updateProfile(user, { photoURL });
      }

      if (tempProfile.name && tempProfile.name !== profile.name) {
        await updateProfile(user, { displayName: tempProfile.name });
      }

      await updateDoc(userRef, updatedProfile);
      setProfile(updatedProfile);
      setModalVisible(false);
    } catch (err) {
      console.error("Save changes error:", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    const notesRef = collection(db, "notes", user.uid, "userNotes");
    await addDoc(notesRef, { text: newNote.trim(), createdAt: new Date() });
    setNewNote("");
  };

  const handleDeleteNote = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "notes", user.uid, "userNotes", id));
  };

  const handleEditNote = (id, text) => {
    setEditingNoteId(id);
    setEditedText(text);
  };

  const handleSaveEdit = async (id) => {
    if (!user || !editedText.trim()) {
      setEditingNoteId(null);
      return;
    }
    const noteRef = doc(db, "notes", user.uid, "userNotes", id);
    await updateDoc(noteRef, { text: editedText });
    setEditingNoteId(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/logout");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4D38" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationBar title="Profile" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <>
                <View style={styles.profileCard}>
                  <Image
                    source={
                      profile.photo
                        ? { uri: profile.photo }
                        : require("../assets/profile.jpg")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.profileName}>{profile.name || "No Name"}</Text>
                  <Text style={styles.profileBio}>{profile.bio || "No bio added."}</Text>
                  <Text style={styles.profileContact}>{profile.contact || "No contact info."}</Text>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setTempProfile(profile);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.editText}>Edit Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <Text style={styles.notesTitle}>My Notes</Text>
                    <TouchableOpacity
                      style={styles.sortButton}
                      onPress={() => setSortNewest(!sortNewest)}
                    >
                      <Text style={styles.sortText}>
                        Sort: {sortNewest ? "Newest" : "Oldest"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.addNoteContainer}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Add a note..."
                      value={newNote}
                      onChangeText={setNewNote}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    <TouchableOpacity
                      style={styles.addNoteButton}
                      onPress={handleAddNote}
                    >
                      <Text style={styles.addNoteText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <View style={styles.noteItem}>
                {editingNoteId === item.id ? (
                  <TextInput
                    style={[styles.noteText, styles.editInput]}
                    value={editedText}
                    onChangeText={setEditedText}
                    onBlur={() => handleSaveEdit(item.id)}
                    multiline
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => handleEditNote(item.id, item.text)}
                  >
                    <Text style={styles.noteText}>{item.text}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No notes yet</Text>}
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={
                    tempProfile.photo
                      ? { uri: tempProfile.photo }
                      : require("../assets/profile.jpg")
                  }
                  style={styles.modalImage}
                />
                <Text style={styles.changePhoto}>Change Photo</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={tempProfile.name}
                onChangeText={(text) =>
                  setTempProfile((prev) => ({ ...prev, name: text }))
                }
              />
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Bio"
                multiline
                value={tempProfile.bio}
                onChangeText={(text) =>
                  setTempProfile((prev) => ({ ...prev, bio: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                keyboardType="phone-pad"
                value={tempProfile.contact}
                onChangeText={(text) =>
                  setTempProfile((prev) => ({ ...prev, contact: text }))
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.saveButton]}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8F5", // Pearl
  },
  profileCard: {
    backgroundColor: "#DFDACF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#262626",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    color: "#4D403A",
    fontFamily: "Poppins_600SemiBold",
  },
  profileBio: {
    color: "#4D403A",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  profileContact: {
    color: "#A3968D",
    marginTop: 5,
    fontFamily: "Poppins_400Regular",
  },
  editButton: {
    backgroundColor: "#A3968D",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  editText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  logoutButton: {
    backgroundColor: "#262626",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 22,
    color: "#4D403A",
    fontFamily: "Poppins_600SemiBold",
  },
  sortButton: {
    backgroundColor: "#DFDACF",
    borderRadius: 8,
    padding: 6,
  },
  sortText: {
    color: "#4D403A",
    fontFamily: "Poppins_600SemiBold",
  },
  addNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DFDACF",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#FFFFFF",
    color: "#262626",
    fontFamily: "Poppins_400Regular",
  },
  bioInput: {
    height: 70,
    textAlignVertical: "top",
  },
  addNoteButton: {
    backgroundColor: "#A3968D",
    marginLeft: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  addNoteText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  noteItem: {
    backgroundColor: "#DFDACF",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteText: {
    color: "#4D403A",
    flex: 1,
    fontFamily: "Poppins_400Regular",
  },
  editInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFDACF",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontFamily: "Poppins_400Regular",
  },
  deleteText: {
    color: "#262626",
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#A3968D",
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FAF8F5",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: "#4D403A",
    marginBottom: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhoto: {
    color: "#A3968D",
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  saveButton: {
    backgroundColor: "#A3968D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  cancelButton: {
    backgroundColor: "#262626",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
});
