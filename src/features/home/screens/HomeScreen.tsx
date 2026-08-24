import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import homepageImg from "../../../assets/images/homepage.png";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/api";
import { useWishlistStore } from "@/store/wishlist.store";

type HomeNav = NativeStackNavigationProp<HomeStackParamList, "HomeScreen">;

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: string;
  rating: string;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string } | unknown>;
  onPress?: () => void;
}

interface BookApiItem {
  id: string;
  title: string;
  author?: {
    username?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  formats?: Array<{ listPrice?: number }>;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string }>;
  [key: string]: unknown;
}

interface FormattedBook {
  id: string;
  title: string;
  author: string;
  price: string;
  rating: string;
  audiobookAvailable?: boolean;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string }>;
  [key: string]: unknown;
}

const BookCard = memo(function BookCard(props: BookCardProps) {
  const {
    id,
    title,
    author,
    price,
    rating,
    bookCover,
    coverUrl,
    cover,
    files,
    onPress,
  } = props;
  const imageUrl =
    bookCover ||
    coverUrl ||
    cover ||
    (files as Array<{ type: string; url: string }> | undefined)?.find(
      (f) => f.type === "COVER",
    )?.url;
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const handleToggle = useCallback(
    (e: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      toggleWishlist(props as unknown as Parameters<typeof toggleWishlist>[0]);
    },
    [props, toggleWishlist],
  );

  return (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.bookCover}>
        {imageUrl ? (
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.bookCoverImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <Ionicons name="book" size={32} color={Colors.secondary} />
        )}
        <TouchableOpacity
          style={styles.wishlistBadge}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={16}
            color={isWishlisted ? "#EF4444" : Colors.gray[600]}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.bookTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {author}
      </Text>
      <View style={styles.bookFooter}>
        <Text style={styles.bookPrice}>{price}</Text>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={Colors.white} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await bookApi.getCategories();
      return res.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ["books", "approved", debouncedSearch, selectedCategory],
    queryFn: async () => {
      const params: Record<string, unknown> = { limit: 12 };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }
      const res = await bookApi.getApproved(params);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const categories = [
    "All",
    ...(categoriesData?.data?.categories?.map(
      (c: { name: string }) => c.name,
    ) || []),
  ];

  const featuredBooks: FormattedBook[] = (booksData?.data?.books || [])
    .map((b: BookApiItem) => ({
      ...b,
      id: b.id,
      title: b.title,
      author: b.author?.profile?.firstName
        ? `${b.author.profile.firstName} ${b.author.profile.lastName}`
        : b.author?.username || "Unknown Author",
      price: b.formats?.[0]?.listPrice
        ? `$${b.formats[0].listPrice.toFixed(2)}`
        : "Free",
      rating: "4.8",
    }))
    .filter((b: FormattedBook) => {
      if (!debouncedSearch.trim()) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
      );
    });

  const handleBookPress = useCallback(
    (book: HomeStackParamList["BookDetail"]["book"]) => {
      navigation.navigate("BookDetail", { book });
    },
    [navigation],
  );

  const renderBookItem = useCallback(
    ({ item }: { item: FormattedBook }) => (
      <BookCard {...item} onPress={() => handleBookPress(item)} />
    ),
    [handleBookPress],
  );

  const keyExtractor = useCallback((item: FormattedBook) => item.id, []);

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={homepageImg}
          style={styles.header}
          imageStyle={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />

          <View style={styles.headerTextContainer}>
            <Text style={styles.slogan}>
              Stories That Inspire, Teach{"\n"}& Transform
            </Text>
            <Text style={styles.headerSubtitle}>
              Inspiring books, audiobooks, and timeless wisdom curated for
              lifelong learners.
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={22}
              color={Colors.gray[500]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search books, authors, audiobooks..."
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.gray[400]}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.curveContainer}>
            <View style={styles.curve} />
          </View>
        </ImageBackground>

        <View style={styles.contentSection}>
          <SectionHeader
            title="Categories"
            onViewAll={() => navigation.getParent()?.navigate("Explore")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <TouchableIndicator
                  key={cat}
                  label={cat}
                  selected={isSelected}
                  onPress={() => setSelectedCategory(cat)}
                />
              );
            })}
          </ScrollView>
        </View>

        {isBooksLoading ? (
          <View style={{ padding: Spacing.xl, alignItems: "center" }}>
            <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
        ) : (
          <>
            <View style={styles.contentSection}>
              <SectionHeader
                title="Featured Books"
                onViewAll={() =>
                  navigation.navigate("BookList", {
                    title: "Featured Books",
                    filterType: "featured",
                  })
                }
              />
              <FlatList
                data={featuredBooks}
                renderItem={renderBookItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No featured books yet.</Text>
                }
              />
            </View>

            <View style={styles.contentSection}>
              <SectionHeader
                title="Popular Audiobook"
                onViewAll={() =>
                  navigation.navigate("BookList", {
                    title: "Popular Audiobooks",
                    filterType: "audiobook",
                  })
                }
              />
              <FlatList
                data={featuredBooks.filter((b) => b.audiobookAvailable)}
                renderItem={renderBookItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No audiobooks available.</Text>
                }
              />
            </View>

            <View style={styles.contentSection}>
              <SectionHeader
                title="Recommended For You"
                onViewAll={() =>
                  navigation.navigate("BookList", {
                    title: "Recommended For You",
                    filterType: "recommended",
                  })
                }
              />
              <FlatList
                data={featuredBooks}
                renderItem={renderBookItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No recommendations found.
                  </Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

function TouchableIndicator({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const DARK_GREEN = "#1B4332";

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 0,
    position: "relative",
    overflow: "hidden",
  },
  headerImage: {
    resizeMode: "cover",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  headerTextContainer: {
    paddingHorizontal: Spacing.lg,
    maxWidth: "75%",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  slogan: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
    fontFamily: "serif",
    lineHeight: 36,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
    fontWeight: "400",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    height: 52,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodySmall,
    fontSize: 14,
    color: Colors.black,
    padding: 0,
  },
  curveContainer: {
    height: 16,
    width: "100%",
    overflow: "hidden",
  },
  curve: {
    height: 40,
    width: "120%",
    marginLeft: "-10%",
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
  },
  contentSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.black,
  },
  viewAll: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FEF3C7",
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: Colors.black,
  },
  carouselRow: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  bookCard: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    height: 140,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    overflow: "hidden",
    position: "relative",
  },
  wishlistBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookCoverImage: {
    width: "100%",
    height: "100%",
  },
  bookTitle: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.black,
  },
  bookAuthor: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  bookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  bookPrice: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.secondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_GREEN,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.white,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    padding: Spacing.md,
    fontStyle: "italic",
  },
});
