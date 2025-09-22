import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Welcome,", userData.username); 
      }

      router.push("/pets");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/raw.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>ReHomeBud</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.link}>
          Don’t have an account?{" "}
          <Text
            style={styles.linkHighlight}
            onPress={() => router.push("/signup")}
          >
            Signup
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#bcd1f1ff",
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    textAlign: "center",
    color: "#5472bfff",
    fontFamily: "Poppins_600SemiBold",
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#5472bfff",
    fontFamily: "Poppins_400Regular",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(235, 237, 241, 1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: "#5472bfff",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  link: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginTop: 15,
    fontFamily: "Poppins_400Regular",
  },
  linkHighlight: {
    color: "#3796d9ff",
    fontFamily: "Poppins_600SemiBold",
  },
});
