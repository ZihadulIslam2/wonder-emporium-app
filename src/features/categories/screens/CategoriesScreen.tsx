import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/api";

// Static UI metadata for categories
const CATEGORY_UI_META: Record<
  string,
  { desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Leadership: {
    desc: "Modern leaders and strategy.",
    icon: "trending-up",
    color: "#D4A574",
  },
  Business: {
    desc: "Growth, finance, and ideas.",
    icon: "briefcase",
    color: "#8B9D77",
  },
  "Faith & Wisdom": {
    desc: "Reflective reads for clarity.",
    icon: "star",
    color: "#B8A07A",
  },
  "Personal Growth": {
    desc: "Habits, mindset, and change.",
    icon: "leaf",
    color: "#7D9B7A",
  },
  Biography: {
    desc: "Lives that shaped history.",
    icon: "person",
    color: "#C49A6C",
  },
  Fiction: {
    desc: "Immersive stories and worlds.",
    icon: "book",
    color: "#9B8B7A",
  },
  "Non-Fiction": {
    desc: "Practical knowledge and insight.",
    icon: "bookmarks",
    color: "#A89375",
  },
  "Children's Books": {
    desc: "Stories for young readers.",
    icon: "happy",
    color: "#B5A07A",
  },
};

const DEFAULT_UI = {
  desc: "Explore this category",
  icon: "library" as const,
  color: "#A89375",
};

export function CategoriesScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await bookApi.getCategories();
      return response.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  const categories = data?.categories || [];

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Categories</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {categories.map((cat: { category: string; count: number }) => {
            const uiMeta = CATEGORY_UI_META[cat.category] || DEFAULT_UI;
            return (
              <TouchableOpacity
                key={cat.category}
                style={styles.card}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: uiMeta.color + "20" },
                  ]}
                >
                  <Ionicons name={uiMeta.icon} size={24} color={uiMeta.color} />
                </View>
                <Text style={styles.cardTitle}>{cat.category}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {uiMeta.desc} ({cat.count} books)
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  backBtn: { width: 40, alignItems: "center" },
  topBarTitle: { ...Typography.h2, color: Colors.black },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.md,
    gap: Spacing.md,
    flex: 1,
    alignContent: "flex-start",
    paddingTop: Spacing.lg,
  },
  card: {
    width: "46%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.caption,
    color: Colors.gray[500],
    lineHeight: 18,
  },
});
