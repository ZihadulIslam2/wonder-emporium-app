import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ExploreStackParamList } from "@/navigation/MainNavigator";

type NavigationProp = NativeStackNavigationProp<
  ExploreStackParamList,
  "CategoriesScreen"
>;

interface CategoryItem {
  name: string;
  count: number;
}

// Curated UI metadata for standard categories
const CATEGORY_UI_META: Record<
  string,
  { desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Adventure: {
    desc: "Thrilling journeys, quests, and exploits.",
    icon: "compass",
    color: "#D97706",
  },
  Fiction: {
    desc: "Immersive tales, novels, and worlds.",
    icon: "book",
    color: "#8B5CF6",
  },
  "Non-Fiction": {
    desc: "Practical wisdom, truth, and insights.",
    icon: "bookmarks",
    color: "#059669",
  },
  Business: {
    desc: "Startups, strategy, and investments.",
    icon: "briefcase",
    color: "#2563EB",
  },
  Leadership: {
    desc: "Vision, team building, and leadership.",
    icon: "trending-up",
    color: "#D4A574",
  },
  "Personal Growth": {
    desc: "Mindset, habits, and self-mastery.",
    icon: "leaf",
    color: "#10B981",
  },
  "Faith & Wisdom": {
    desc: "Reflective reads for clarity and soul.",
    icon: "star",
    color: "#F59E0B",
  },
  Biography: {
    desc: "Memoirs of figures who shaped history.",
    icon: "person",
    color: "#EA580C",
  },
  "Children's Books": {
    desc: "Joyful stories for young minds.",
    icon: "happy",
    color: "#EC4899",
  },
  "Science & Tech": {
    desc: "Modern computing, AI, and discovery.",
    icon: "hardware-chip",
    color: "#06B6D4",
  },
  Romance: {
    desc: "Heartwarming stories and emotional bonds.",
    icon: "heart",
    color: "#E11D48",
  },
  Mystery: {
    desc: "Puzzles, suspense, and detective tales.",
    icon: "eye",
    color: "#4F46E5",
  },
};

const DEFAULT_UI = {
  desc: "Explore curated titles in this category.",
  icon: "library" as const,
  color: "#A89375",
};

const CURATED_DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: "Adventure", count: 0 },
  { name: "Fiction", count: 0 },
  { name: "Non-Fiction", count: 0 },
  { name: "Business", count: 0 },
  { name: "Leadership", count: 0 },
  { name: "Personal Growth", count: 0 },
  { name: "Faith & Wisdom", count: 0 },
  { name: "Biography", count: 0 },
  { name: "Children's Books", count: 0 },
  { name: "Science & Tech", count: 0 },
  { name: "Romance", count: 0 },
  { name: "Mystery", count: 0 },
];

export function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await bookApi.getCategories();
      return response.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  // Extract categories from backend response with support for all common response formats
  const categories: CategoryItem[] = useMemo(() => {
    type RawCategoryItem = {
      name?: string;
      category?: string;
      count?: number;
    };

    interface CategoriesApiResponse {
      data?: {
        categories?: RawCategoryItem[];
      };
      categories?: RawCategoryItem[];
    }

    const res = data as CategoriesApiResponse | undefined;
    const rawList: RawCategoryItem[] =
      res?.data?.categories ||
      res?.categories ||
      (Array.isArray(data) ? (data as RawCategoryItem[]) : []);

    const countMap = new Map<string, number>();

    rawList.forEach((item) => {
      const name = item.name || item.category;
      if (name && typeof name === "string") {
        countMap.set(name.trim(), item.count ?? 0);
      }
    });

    const result: CategoryItem[] = [];
    const addedNames = new Set<string>();

    // 1. Add categories returned from backend with active books
    countMap.forEach((count, name) => {
      result.push({ name, count });
      addedNames.add(name.toLowerCase());
    });

    // 2. Merge with curated categories so user always has standard genres to explore
    CURATED_DEFAULT_CATEGORIES.forEach((cat) => {
      if (!addedNames.has(cat.name.toLowerCase())) {
        result.push(cat);
        addedNames.add(cat.name.toLowerCase());
      }
    });

    return result;
  }, [data]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (CATEGORY_UI_META[cat.name]?.desc || "").toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  const handleCategoryPress = useCallback(
    (categoryName: string) => {
      navigation.navigate("BookList", {
        title: categoryName,
        category: categoryName,
      });
    },
    [navigation],
  );

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.getParent()?.navigate("Home");
    }
  }, [navigation]);

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Categories</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[Colors.secondary]}
            tintColor={Colors.secondary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.gray[400]}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Header */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>All Genres & Subjects</Text>
          <Text style={styles.categoryCountBadge}>
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "category" : "categories"}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.secondary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : isError && categories.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={Colors.error}
            />
            <Text style={styles.errorText}>Failed to load categories</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredCategories.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons
              name="search-outline"
              size={44}
              color={Colors.gray[400]}
            />
            <Text style={styles.emptyText}>
              No categories found matching "{searchQuery}"
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredCategories.map((cat) => {
              const uiMeta = CATEGORY_UI_META[cat.name] || DEFAULT_UI;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() => handleCategoryPress(cat.name)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: uiMeta.color + "18" },
                    ]}
                  >
                    <Ionicons
                      name={uiMeta.icon}
                      size={24}
                      color={uiMeta.color}
                    />
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {uiMeta.desc}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.bookCountText}>
                      {cat.count > 0
                        ? `${cat.count} ${cat.count === 1 ? "book" : "books"}`
                        : "Explore"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={Colors.gray[400]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 54,
    paddingBottom: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.black,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.black,
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.gray[800],
    fontWeight: "700",
  },
  categoryCountBadge: {
    ...Typography.caption,
    color: Colors.gray[500],
    fontWeight: "600",
  },
  centerContainer: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    marginTop: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "600",
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.gray[500],
    lineHeight: 15,
    marginBottom: Spacing.sm,
    minHeight: 30,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  bookCountText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.secondary,
  },
});
