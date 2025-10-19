import React, { useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";

export default function Splash() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/"); 
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
        <Image
          source={require("../assets/raw.png")} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>ReHomeBud</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#bcd1f1",
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 6, 
  },
  title: {
    fontSize: 32,
    color: "#5472bfff",
    fontFamily: "Poppins_600SemiBold",
  },
});
