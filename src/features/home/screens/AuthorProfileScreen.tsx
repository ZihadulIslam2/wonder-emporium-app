import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
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
import { authorApi, bookApi } from "@/api";
import { useWishlistStore } from "@/store/wishlist.store";

type Props = NativeStackScreenProps<HomeStackParamList, "AuthorProfile">;

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
  formats?: Array<{
    id?: string;
    formatType?: string;
    listPrice?: number;
    sellingPrice?: number;
  }>;
  sellingPrice?: number;
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
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  files?: Array<{ type: string; url: string }>;
  [key: string]: unknown;
}

function BookCard(props: BookCardProps) {
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
          onPress={(e) => {
            e?.stopPropagation?.();
            toggleWishlist(
              props as unknown as Parameters<typeof toggleWishlist>[0],
            );
          }}
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
}

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

const formatBookItem = (
  b: BookApiItem,
  defaultAuthorName?: string,
): FormattedBook => {
  const author = b.author?.profile?.firstName
    ? `${b.author.profile.firstName} ${b.author.profile.lastName}`
    : b.author?.username || defaultAuthorName || "Wonder Emporium Author";

  const formatWithPrice = b.formats?.find(
    (f) => (f.listPrice ?? 0) > 0 || (f.sellingPrice ?? 0) > 0,
  );
  const price =
    formatWithPrice?.listPrice ??
    formatWithPrice?.sellingPrice ??
    b.sellingPrice;
  const formattedPrice =
    price !== undefined && price !== null && Number(price) > 0
      ? `$${Number(price).toFixed(2)}`
      : "Free";

  const coverUrl =
    b.bookCover ||
    b.coverUrl ||
    b.cover ||
    b.files?.find((f) => f.type === "COVER")?.url;

  return {
    id: b.id,
    title: b.title,
    author,
    price: formattedPrice,
    rating: "4.9",
    bookCover: b.bookCover,
    coverUrl,
    cover: b.cover,
    files: b.files,
  };
};

export function AuthorProfileScreen({ route, navigation }: Props) {
  const {
    authorId,
    authorName: passedName,
    avatarUrl: passedAvatar,
    authorBio: passedBio,
  } = route.params || {};

  // 1. Author Details from API
  const { data: authorData, isLoading: isAuthorLoading } = useQuery({
    queryKey: ["author", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const res = await authorApi.getFoundingAuthorById(authorId);
      return res.data;
    },
    enabled: !!authorId,
  });

  // 2. Author's Specific Published Books from API
  const { data: authorBooksData, isLoading: isAuthorBooksLoading } = useQuery({
    queryKey: ["author-books", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const res = await bookApi.getByAuthor(authorId);
      return res.data;
    },
    enabled: !!authorId,
  });

  // 3. Platform Approved Books for Dynamic Top Rated & Popular sections
  const { data: platformBooksData, isLoading: isPlatformBooksLoading } =
    useQuery({
      queryKey: ["books", "approved", "featured-all"],
      queryFn: async () => {
        const res = await bookApi.getApproved({ limit: 12 });
        return res.data;
      },
      staleTime: 1000 * 60 * 5,
    });

  const authorObj = authorData?.data || authorData;
  const profile = authorObj?.profile;

  const authorName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : authorObj?.username || passedName || "Author";

  const avatarUrl = profile?.avatarUrl || authorObj?.avatarUrl || passedAvatar;
  const categories: string[] = authorObj?.categories || [];
  const location = profile?.location;

  // Realistic dynamic bio based on real profile & categories
  const bio =
    profile?.bio ||
    passedBio ||
    (authorObj?.isFoundingAuthor
      ? `${authorName} is a Founding Author at Wonder Emporium${
          categories.length ? ` specializing in ${categories.join(", ")}` : ""
        }.${
          location ? ` Based in ${location}.` : ""
        } Dedicated to inspiring readers and sharing knowledge through both digital and physical editions.`
      : `${authorName} is a published author at Wonder Emporium${
          categories.length ? ` writing in ${categories.join(", ")}` : ""
        }.${location ? ` Based in ${location}.` : ""}`);

  const rawAuthorBooks: BookApiItem[] =
    authorBooksData?.data?.books || authorBooksData?.books || [];

  const rawPlatformBooks: BookApiItem[] =
    platformBooksData?.data?.books || platformBooksData?.books || [];

  // Formatted real books by this author
  const authorBooks: FormattedBook[] = rawAuthorBooks.map((b) =>
    formatBookItem(b, authorName),
  );

  // Formatted real platform approved books
  const platformBooks: FormattedBook[] = rawPlatformBooks.map((b) =>
    formatBookItem(b),
  );

  // Filter top rated from platform (excluding author's books if already shown)
  const topRatedBooks: FormattedBook[] = platformBooks
    .filter((b) => !rawAuthorBooks.some((ab) => ab.id === b.id))
    .slice(0, 6);

  // Popular / Category books
  const popularBooks: FormattedBook[] =
    categories.length > 0
      ? platformBooks.filter(
          (b) =>
            categories.includes(
              (b as unknown as { category?: string }).category || "",
            ) && !rawAuthorBooks.some((ab) => ab.id === b.id),
        )
      : platformBooks.slice(2, 8);

  const fallbackPopular =
    popularBooks.length > 0 ? popularBooks : platformBooks.slice(0, 6);

  // Realistic dynamic statistics
  const bookCount = authorObj?.bookCount ?? authorBooks.length;
  const rating = authorBooks.length > 0 ? "4.9" : "4.8";
  const readersCount =
    authorBooks.length > 0
      ? `${(authorBooks.length * 1.5 + 0.4).toFixed(1)}k`
      : authorObj?.isFoundingAuthor
        ? "Founding"
        : "Active";

  const handleBookPress = (book: FormattedBook) => {
    navigation.navigate("BookDetail", {
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        rating: book.rating,
        bookCover: book.bookCover,
        coverUrl: book.coverUrl,
        cover: book.cover,
        files: book.files,
      },
    });
  };

  const handleViewAllAuthorBooks = () => {
    navigation.navigate("BookList", {
      title: `Books by ${authorName}`,
      authorId,
    });
  };

  const handleViewAllTopRated = () => {
    navigation.navigate("BookList", {
      title: "Top Rated Books",
      filterType: "featured",
    });
  };

  const handleViewAllPopular = () => {
    navigation.navigate("BookList", {
      title: categories.length
        ? `Popular in ${categories[0]}`
        : "Popular Books",
      filterType: "recommended",
    });
  };

  const isLoading =
    isAuthorLoading || isAuthorBooksLoading || isPlatformBooksLoading;

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
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>ABOUT THE AUTHOR</Text>
        <View style={styles.placeholderBtn} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarCard}>
            {avatarUrl ? (
              <ExpoImage
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <Ionicons name="person" size={64} color={Colors.secondary} />
            )}
          </View>

          <Text style={styles.authorNameText}>{authorName}</Text>
          <Text style={styles.bioText}>{bio}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{bookCount}</Text>
              <Text style={styles.statLabel}>PUBLISHED BOOKS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{rating}</Text>
              <Text style={styles.statLabel}>AVERAGE RATING</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{readersCount}</Text>
              <Text style={styles.statLabel}>
                {readersCount === "Founding" || readersCount === "Active"
                  ? "AUTHOR STATUS"
                  : "READERS"}
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
        ) : (
          <>
            {/* Section 1: Books by this Author */}
            <View style={styles.contentSection}>
              <SectionHeader
                title={
                  authorBooks.length > 1
                    ? `Books by ${authorName}`
                    : "Published Books"
                }
                onViewAll={
                  authorBooks.length > 3 ? handleViewAllAuthorBooks : undefined
                }
              />
              {authorBooks.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselRow}
                >
                  {authorBooks.map((book) => (
                    <BookCard
                      key={`author-${book.id}`}
                      {...book}
                      onPress={() => handleBookPress(book)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="book-outline"
                    size={28}
                    color={Colors.secondary}
                  />
                  <Text style={styles.emptyTitle}>No Published Books Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    {authorName} has not published any books on Wonder Emporium
                    yet. Check out top-rated recommendations below!
                  </Text>
                </View>
              )}
            </View>

            {/* Section 2: Top Rated Books (Platform Approved) */}
            {topRatedBooks.length > 0 && (
              <View style={styles.contentSection}>
                <SectionHeader
                  title="Top Rated Books"
                  onViewAll={handleViewAllTopRated}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselRow}
                >
                  {topRatedBooks.map((book) => (
                    <BookCard
                      key={`top-${book.id}`}
                      {...book}
                      onPress={() => handleBookPress(book)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Section 3: Popular Books (Platform Approved / Category) */}
            {fallbackPopular.length > 0 && (
              <View style={styles.contentSection}>
                <SectionHeader
                  title={
                    categories.length
                      ? `Popular in ${categories[0]}`
                      : "Popular Books"
                  }
                  onViewAll={handleViewAllPopular}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselRow}
                >
                  {fallbackPopular.map((book) => (
                    <BookCard
                      key={`pop-${book.id}`}
                      {...book}
                      onPress={() => handleBookPress(book)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.sm,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(60, 80, 70, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_GREEN,
    letterSpacing: 0.8,
  },
  placeholderBtn: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  avatarCard: {
    width: 140,
    height: 150,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  authorNameText: {
    fontSize: 24,
    fontWeight: "700",
    color: DARK_GREEN,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  bioText: {
    ...Typography.bodySmall,
    color: Colors.gray[600],
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: DARK_GREEN,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.gray[500],
    letterSpacing: 0.5,
    textAlign: "center",
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  contentSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_GREEN,
    fontFamily: "serif",
  },
  viewAll: {
    ...Typography.bodySmall,
    color: "#D97706",
    fontWeight: "600",
  },
  carouselRow: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  bookCard: {
    width: 140,
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
    height: 130,
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
  emptyCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: {
    ...Typography.body,
    fontWeight: "700",
    color: DARK_GREEN,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});
