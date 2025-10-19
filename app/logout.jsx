import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function Logout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggingOut(false);
    }, 2000); // ⏳ show spinner for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleGoToLogin = () => {
    router.replace("/"); // 👈 go back to your login screen (index.jsx)
  };

  return (
    <View style={styles.container}>
      {isLoggingOut ? (
        <>
          <ActivityIndicator size="large" color="#5C4033" />
          <Text style={styles.loggingOutText}>Logging out...</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>You’ve been logged out</Text>
          <TouchableOpacity style={styles.button} onPress={handleGoToLogin}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5", // Pearl
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: "#4D403A", // Cacao
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  loggingOutText: {
    marginTop: 20,
    fontSize: 18,
    color: "#A3968D", // Taupe
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4D403A", // Cacao
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#262626", // Leather shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF", // White text on cacao button
    fontSize: 16,
    fontWeight: "600",
  },
});
