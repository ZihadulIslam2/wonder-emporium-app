import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";

interface SplashScreenProps {
  onAnimationEnd?: () => void;
}

export function SplashScreen({ onAnimationEnd }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Text entrance
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 3. Continuous gentle pulse & sparkle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // 4. Progress bar animation
    Animated.timing(barWidth, {
      toValue: 1,
      duration: 1800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    });
  }, [
    logoScale,
    logoOpacity,
    textOpacity,
    textTranslateY,
    pulseAnim,
    sparkleRotate,
    barWidth,
    onAnimationEnd,
  ]);

  const spin = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressInterpolate = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Main Logo & Animated Badge */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }],
            },
          ]}
        >
          {/* Outer Gold Glow Ring */}
          <View style={styles.outerGlowRing} />
          <View style={styles.innerGlowRing} />

          {/* Core Badge */}
          <View style={styles.logoBadge}>
            <Ionicons name="book" size={56} color="#D97706" />

            {/* Floating rotating sparkle icon */}
            <Animated.View
              style={[styles.sparkleBadge, { transform: [{ rotate: spin }] }]}
            >
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Brand Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>Wonder Emporium</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Ionicons
              name="star"
              size={12}
              color="#D97706"
              style={{ marginHorizontal: 8 }}
            />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.tagline}>
            Where Readers & Founding Authors Connect
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Progress & Footer */}
      <View style={styles.bottomSection}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressInterpolate }]}
          />
        </View>
        <Text style={styles.loadingText}>Opening the emporium...</Text>
        <Text style={styles.footerText}>
          © 2026 Wonder Emporium • All Rights Reserved
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    position: "relative",
  },
  outerGlowRing: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(217, 119, 6, 0.25)",
  },
  innerGlowRing: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(254, 243, 199, 0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(217, 119, 6, 0.35)",
  },
  logoBadge: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#D97706",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  sparkleBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    elevation: 4,
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    ...Typography.h1,
    fontSize: 32,
    fontWeight: "800",
    color: "#134E4A",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
    width: 180,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(217, 119, 6, 0.35)",
  },
  tagline: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: Spacing.xxl + 8,
    paddingHorizontal: Spacing.xl,
  },
  progressBarContainer: {
    width: 180,
    height: 4,
    backgroundColor: "rgba(19, 78, 74, 0.12)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#134E4A",
    borderRadius: 2,
  },
  loadingText: {
    ...Typography.caption,
    color: "#134E4A",
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: Spacing.md,
  },
  footerText: {
    ...Typography.caption,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
