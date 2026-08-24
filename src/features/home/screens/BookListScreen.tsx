import React, { useCallback } from "react";
import {
  View,
  Text,
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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";
import { useQuery } from "@tanstack/react-query";
import { bookApi } from "@/api";
import { useWishlistStore } from "@/store/wishlist.store";

type Props = NativeStackScreenProps<HomeStackParamList, "BookList">;

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
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string }>;
  formats?: Array<{ id: string; formatType?: string; listPrice?: number }>;
  audiobookAvailable?: boolean;
  [key: string]: unknown;
}

export function BookListScreen({ route, navigation }: Props) {
  const { title, filterType } = route.params;
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const { data: booksData, isLoading } = useQuery({
    queryKey: ["books-list", filterType],
    queryFn: async () => {
      const res = await bookApi.getApproved({ limit: 20 });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const rawBooks = booksData?.data?.books || booksData?.books || [];

  let books = rawBooks.map((b: BookApiItem) => ({
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
    coverUrl:
      b.bookCover ||
      b.coverUrl ||
      b.cover ||
      b.files?.find((f: { type: string; url: string }) => f.type === "COVER")
        ?.url,
    audiobookAvailable:
      b.files?.some(
        (f: { type: string; url: string }) => f.type === "AUDIOBOOK",
      ) ||
      b.formats?.some(
        (f: { formatType?: string }) => f.formatType === "AUDIOBOOK",
      ),
  }));

  if (filterType === "audiobook") {
    books = books.filter(
      (b: { audiobookAvailable?: boolean }) => b.audiobookAvailable,
    );
  }

  const handleBookPress = useCallback(
    (book: HomeStackParamList["BookDetail"]["book"]) => {
      navigation.navigate("BookDetail", { book });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof books)[0] }) => {
      const isWishlisted = wishlistItems.some((w) => w.id === item.id);
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleBookPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.coverContainer}>
            {item.coverUrl ? (
              <ExpoImage
                source={{ uri: item.coverUrl }}
                style={styles.coverImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <Ionicons name="book" size={40} color={Colors.secondary} />
            )}
            <TouchableOpacity
              style={styles.wishlistBadge}
              onPress={() => toggleWishlist(item)}
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
            {item.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>{item.price}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color={Colors.white} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleBookPress, toggleWishlist, wishlistItems],
  );

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={4}
          removeClippedSubviews
          ListEmptyComponent={
            <Text style={styles.emptyText}>No books available.</Text>
          }
        />
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
  topBarTitle: { ...Typography.h3, color: Colors.black },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
    color: Colors.gray[500],
    marginTop: Spacing.xl,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  coverContainer: {
    height: 160,
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
  coverImage: {
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  priceText: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.secondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.white,
    fontWeight: "600",
  },
});
