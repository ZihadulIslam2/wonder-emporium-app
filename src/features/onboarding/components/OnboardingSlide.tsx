import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { OnboardingSlideData } from "../data";

import imgSlide1 from "@/assets/onboarding/image 301.png";
import imgSlide2 from "@/assets/onboarding/image 302.png";
import imgSlide3 from "@/assets/onboarding/image 303 (2).png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
}

const slideImages = {
  1: imgSlide1,
  2: imgSlide2,
  3: imgSlide3,
};

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={slideImages[slide.id as keyof typeof slideImages]}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 280,
    height: 260,
  },
  title: {
    ...Typography.h2,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
});
