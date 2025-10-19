import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import NavigationBar from "../components/NavigationBar";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPetId, setEditingPetId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const q = query(
        collection(db, "pets"),
        where("userId", "==", auth.currentUser?.uid)
      );
      const snapshot = await getDocs(q);
      const petData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petData);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewPet = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.5,
      });

      if (result.canceled) return;

      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

      const newPet = {
        userId: auth.currentUser?.uid,
        name: "New Pet",
        type: "Dog",
        breed: "Unknown",
        age: "0",
        health: "Healthy",
        status: "Available",
        photo: base64Image,
      };

      await addDoc(collection(db, "pets"), newPet);
      fetchPets();
    } catch (error) {
      console.error("Error adding pet:", error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Adopted" ? "Available" : "Adopted";
      await updateDoc(doc(db, "pets", id), { status: newStatus });
      fetchPets();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const startEditPet = (pet) => {
    setEditingPetId(pet.id);
    setEditedData(pet);
  };

  const saveEditPet = async () => {
    try {
      await updateDoc(doc(db, "pets", editingPetId), editedData);
      setEditingPetId(null);
      setEditedData({});
      fetchPets();
    } catch (error) {
      console.error("Error saving pet:", error);
    }
  };

  const deletePet = async (id) => {
    Alert.alert("Delete Pet", "Are you sure you want to delete this pet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "pets", id));
            fetchPets();
          } catch (error) {
            console.error("Error deleting pet:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage your Pets</Text>
      <NavigationBar />

      <TouchableOpacity style={styles.addButton} onPress={addNewPet}>
        <Text style={styles.addButtonText}>+ Add New Pet</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#5A3825" style={{ marginTop: 20 }} />
      ) : pets.length === 0 ? (
        <Text style={styles.emptyText}>No pets added yet.</Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.petImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={{ color: "#F2E8D5" }}>No photo</Text>
                </View>
              )}

              <View style={styles.petInfo}>
                {editingPetId === item.id ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editedData.name}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, name: text })
                      }
                      placeholder="Name"
                    />
                    <TextInput
                      style={styles.input}
                      value={editedData.type}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, type: text })
                      }
                      placeholder="Type"
                    />
                    <TextInput
                      style={styles.input}
                      value={editedData.breed}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, breed: text })
                      }
                      placeholder="Breed"
                    />
                    <TextInput
                      style={styles.input}
                      value={editedData.age}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, age: text })
                      }
                      placeholder="Age"
                    />
                    <TextInput
                      style={styles.input}
                      value={editedData.health}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, health: text })
                      }
                      placeholder="Health"
                    />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#6B4F3B" }]}
                        onPress={saveEditPet}
                      >
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#9B7653" }]}
                        onPress={() => setEditingPetId(null)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.petName}>{item.name}</Text>
                    <Text style={styles.petDetails}>
                      Type: {item.type} | Breed: {item.breed} | Age: {item.age} | Health: {item.health}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.status === "Adopted" ? "#8C3A2B" : "#4F6B30" },
                      ]}
                    >
                      Status: {item.status}
                    </Text>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.statusButton]}
                        onPress={() => toggleStatus(item.id, item.status)}
                      >
                        <Text style={styles.buttonText}>
                          {item.status === "Adopted" ? "Mark Available" : "Mark Adopted"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton]}
                        onPress={() => startEditPet(item)}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.deleteButton]}
                        onPress={() => deletePet(item.id)}
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}
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
    marginBottom: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  addButton: {
    backgroundColor: "#A3968D", // Taupe
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF", // White
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  petCard: {
    flexDirection: "row",
    backgroundColor: "#DFDACF", // Khaki
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#A3968D", // Taupe
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    color: "#262626", // Leather
    fontFamily: "Poppins_600SemiBold",
  },
  petDetails: {
    fontSize: 13,
    color: "#4D403A", // Cacao
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  statusText: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
    color: "#262626", // Leather
  },
  buttonRow: {
    flexDirection: "row",
    gap: 6,
  },
  statusButton: {
    flex: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#A3968D", // Taupe
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#4D403A", // Cacao
  },
  deleteButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#262626", // Leather
  },
  buttonText: {
    color: "#FFFFFF", // White
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DFDACF", // Khaki
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    backgroundColor: "#FFFFFF", // White
    color: "#262626", // Leather
    fontFamily: "Poppins_400Regular",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#A3968D", // Taupe
    fontFamily: "Poppins_400Regular",
  },
});
