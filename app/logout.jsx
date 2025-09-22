import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setLoading(false);
      router.replace("/");
    } catch (err) {
      setLoading(false);
      console.error("Logout error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>👋 You have logged out</Text>
        <Text style={styles.subtitle}>See you again soon!</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#5472bfff" />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogout}>
            <Text style={styles.loginText}>Go to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#bcd1f1ff", 
    padding: 24,
  },

  card: {
    width: "90%",
    backgroundColor: "#fff", 
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },

  title: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#5472bfff", 
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#5b88c7ba",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },

  loginButton: {
    width: "80%",
    backgroundColor: "#5472bfff", 
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.5,
  },
});
