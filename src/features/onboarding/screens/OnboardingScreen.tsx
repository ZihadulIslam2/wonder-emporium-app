import { useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/styles/spacing";
import { onboardingSlides } from "../data";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { PaginationDots } from "../components/PaginationDots";
import { ActionButton } from "../components/ActionButton";
import { useOnboarding } from "../hooks/useOnboarding";
import bgImage from "@/assets/onboarding/onboarding bg.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();

  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  }, [currentIndex, isLastSlide, completeOnboarding]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      setCurrentIndex(index);
    },
    [],
  );

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          renderItem={({ item }) => <OnboardingSlide slide={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        <View style={styles.footer}>
          <PaginationDots
            total={onboardingSlides.length}
            currentIndex={currentIndex}
          />

          <ActionButton
            label={isLastSlide ? "Get Started" : "Next"}
            onPress={handleNext}
          />

          {!isLastSlide && (
            <ActionButton label="Skip" onPress={handleSkip} variant="text" />
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  container: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
});
