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
          onPress={() =>
            toggleWishlist(
              props as unknown as Parameters<typeof toggleWishlist>[0],
            )
          }
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

export function AuthorProfileScreen({ route, navigation }: Props) {
  const {
    authorId,
    authorName: passedName,
    avatarUrl: passedAvatar,
    authorBio: passedBio,
  } = route.params || {};

  const { data: authorData, isLoading: isAuthorLoading } = useQuery({
    queryKey: ["author", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const res = await authorApi.getFoundingAuthorById(authorId);
      return res.data;
    },
    enabled: !!authorId,
  });

  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ["author-books", authorId],
    queryFn: async () => {
      if (!authorId) return null;
      const res = await bookApi.getByAuthor(authorId);
      return res.data;
    },
    enabled: !!authorId,
  });

  const authorObj = authorData?.data || authorData;
  const profile = authorObj?.profile;

  const authorName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : authorObj?.username || passedName || "Rodney Smith";

  const avatarUrl = profile?.avatarUrl || authorObj?.avatarUrl || passedAvatar;

  const bio =
    profile?.bio ||
    passedBio ||
    `${authorName} is an organizational psychologist, bestselling author, and executive coach to CEOs of Fortune 500 companies. With over two decades of experience studying human behavior in the workplace, he has dedicated his career to understanding what makes teams thrive and organizations endure.`;

  const bookCount = authorObj?.bookCount ?? 265;
  const rating = "4.9";
  const readersCount = "1.2M";

  const rawBooks: BookApiItem[] =
    booksData?.data?.books || booksData?.books || [];

  const formattedBooks: FormattedBook[] =
    rawBooks.length > 0
      ? rawBooks.map((b) => ({
          id: b.id,
          title: b.title,
          author: authorName,
          price: b.formats?.[0]?.listPrice
            ? `$${b.formats[0].listPrice.toFixed(2)}`
            : "$18.99",
          rating: "4.9",
          bookCover: b.bookCover,
          coverUrl: b.coverUrl,
          cover: b.cover,
          files: b.files,
        }))
      : [
          {
            id: "quiet-leader-1",
            title: "The Quiet Leader",
            author: authorName || "Marcus Aldridge",
            price: "$18.99",
            rating: "4.9",
          },
          {
            id: "quiet-leader-2",
            title: "The Quiet Leader",
            author: authorName || "Marcus Aldridge",
            price: "$18.99",
            rating: "4.9",
          },
          {
            id: "quiet-leader-3",
            title: "The Quiet Leader",
            author: authorName || "Marcus Aldridge",
            price: "$18.99",
            rating: "4.9",
          },
        ];

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

  const handleViewAllBooks = (sectionTitle: string) => {
    navigation.navigate("BookList", {
      title: `${authorName} - ${sectionTitle}`,
      filterType: "featured",
    });
  };

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
              <Text style={styles.statLabel}>READERS</Text>
            </View>
          </View>
        </View>

        {isAuthorLoading || isBooksLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
        ) : (
          <>
            <View style={styles.contentSection}>
              <SectionHeader
                title="Top Rated"
                onViewAll={() => handleViewAllBooks("Top Rated")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
              >
                {formattedBooks.map((book, index) => (
                  <BookCard
                    key={`top-${book.id}-${index}`}
                    {...book}
                    onPress={() => handleBookPress(book)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.contentSection}>
              <SectionHeader
                title="Popular Books"
                onViewAll={() => handleViewAllBooks("Popular Books")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
              >
                {formattedBooks.map((book, index) => (
                  <BookCard
                    key={`pop-${book.id}-${index}`}
                    {...book}
                    onPress={() => handleBookPress(book)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.contentSection}>
              <SectionHeader
                title="All Books"
                onViewAll={() => handleViewAllBooks("All Books")}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselRow}
              >
                {formattedBooks.map((book, index) => (
                  <BookCard
                    key={`all-${book.id}-${index}`}
                    {...book}
                    onPress={() => handleBookPress(book)}
                  />
                ))}
              </ScrollView>
            </View>
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
});
