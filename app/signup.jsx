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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore"; 

import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

export default function Signup() {
  const [username, setUsername] = useState("");
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

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });

      router.push("/pets");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/f.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>ReHomeBud</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#888"
          autoCapitalize="none"
        />

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

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>

        <Text style={styles.link}>
          Already have an account?{" "}
          <Text
            style={styles.linkHighlight}
            onPress={() => router.push("/")}
          >
            Login
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
    backgroundColor: "#FAF8F5", // Pearl background
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
    color: "#4D403A", // Cacao - elegant brown
    fontFamily: "Poppins_600SemiBold",
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#A3968D", // Taupe - soft neutral tone
    fontFamily: "Poppins_400Regular",
  },
  card: {
    backgroundColor: "#DFDACF", // Khaki - soft contrast card
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: "#262626", // Leather - subtle depth
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#A3968D", // Taupe border
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FFFFFF", // Clean white fields
    fontFamily: "Poppins_400Regular",
    color: "#4D403A", // Cacao text
  },
  button: {
    backgroundColor: "#4D403A", // Cacao - main call to action
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#FAF8F5", // Pearl text for contrast
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  link: {
    fontSize: 14,
    textAlign: "center",
    color: "#4D403A", // Cacao text
    marginTop: 15,
    fontFamily: "Poppins_400Regular",
  },
  linkHighlight: {
    color: "#A3968D", // Taupe highlight for subtle elegance
    fontFamily: "Poppins_600SemiBold",
  },
});
