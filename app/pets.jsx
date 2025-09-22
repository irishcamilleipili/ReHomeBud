import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image, 
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [health, setHealth] = useState("");
  const [status, setStatus] = useState("Available");
  const router = useRouter();

  const petsRef = collection(db, "pets");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(petsRef, where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPets(list);
    });
    return () => unsubscribe();
  }, []);

  // CREATE
  const addPet = async () => {
    if (!name || !type) {
      alert("⚠️ Please enter pet name and type!");
      return;
    }
    try {
      await addDoc(petsRef, {
        name,
        type,
        breed,
        age,
        health,
        status,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setName("");
      setType("");
      setBreed("");
      setAge("");
      setHealth("");
      setStatus("Available");
    } catch (error) {
      console.error("Error adding pet:", error);
      Alert.alert("Error", "Could not add pet.");
    }
  };

  // UPDATE
  const toggleStatus = async (id, currentStatus) => {
    try {
      const petDoc = doc(db, "pets", id);
      await updateDoc(petDoc, {
        status: currentStatus === "Available" ? "Adopted" : "Available",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating pet:", error);
      Alert.alert("Error", "Could not update pet.");
    }
  };

  // DELETE
  const deletePet = async (id) => {
    try {
      await deleteDoc(doc(db, "pets", id));
    } catch (error) {
      console.error("Error deleting pet:", error);
      Alert.alert("Error", "Could not delete pet.");
    }
  };

  return (
    <View style={styles.container}>
      
      <Image source={require("../assets/raw.png")} style={styles.logo} />

      <Text style={styles.title}>Manage Your Pets</Text>
      <Text style={styles.subtitle}>Add and track your pet’s info</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Type"
          value={type}
          onChangeText={setType}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Breed"
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Health"
          value={health}
          onChangeText={setHealth}
          style={styles.input}
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.addButton} onPress={addPet}>
          <Text style={styles.addButtonText}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.petCard}>
            <View style={styles.petHeader}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petType}>{item.type}</Text>
            </View>

            <Text style={styles.petInfo}>🐕 Breed: {item.breed || "N/A"}</Text>
            <Text style={styles.petInfo}>🎂 Age: {item.age || "N/A"}</Text>
            <Text style={styles.petInfo}>❤️ Health: {item.health || "N/A"}</Text>

            <Text
              style={[
                styles.petStatus,
                { color: item.status === "Available" ? "#2e8b57" : "#b23b3b" },
              ]}
            >
              {item.status}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleStatus(item.id, item.status)}
              >
                <Text style={styles.actionButtonText}>
                  {item.status === "Available" ? "Mark Adopted" : "Mark Available"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#ff5c5c" }]}
                onPress={() => deletePet(item.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/logout")}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#bcd1f1ff", 
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 26,
    color: "#5472bfff",
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#5b88c7ba",
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },

  form: {
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d0d8ec", 
    fontFamily: "Poppins_400Regular",
  },

  addButton: {
    backgroundColor: "#5472bfff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },

  addButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },

  petCard: {
    backgroundColor: "#fff", 
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d0d8ec",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },

  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  petName: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#43699B", 
  },

  petType: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#888", 
  },
  petInfo: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
    color: "#333",
  },
  petStatus: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },

  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#5472bfff",
  },

  actionButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },

  logoutButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#5472bfff", 
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});