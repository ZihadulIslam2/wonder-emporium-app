import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery } from "@tanstack/react-query";
import { libraryApi, bookApi, LibraryItem } from "@/api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/MainNavigator";

type ProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "MyLibraryScreen"
>;

interface FormattedLibraryBook {
  id: string;
  orderItemId?: string;
  title: string;
  author: string;
  rating: string;
  progress: number; // percentage (0-100)
  type: "EBOOK" | "AUDIOBOOK";
  status: "COMPLETED" | "READING" | "NOT_STARTED";
  coverUrl: string;
}

const FILTER_TABS = ["All", "eBooks", "Audiobooks", "Completed"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export function MyLibraryScreen() {
  const navigation = useNavigation<ProfileNav>();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  // Fetch Library items from backend API
  const { data: libraryRes, isLoading: isLibraryLoading } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const res = await libraryApi.getLibrary();
      return res.data;
    },
  });

  // Fetch Recommended books from approved books API
  const { data: recommendedRes } = useQuery({
    queryKey: ["books", "recommended"],
    queryFn: async () => {
      const res = await bookApi.getApproved({ limit: 4 });
      return res.data;
    },
  });

  // Extract array of LibraryItem from response
  const apiLibraryItems: LibraryItem[] = Array.isArray(libraryRes)
    ? libraryRes
    : (libraryRes as unknown as { data?: LibraryItem[] })?.data || [];

  // Format Library items from API response
  const libraryBooks: FormattedLibraryBook[] = apiLibraryItems.map(
    (item, idx) => {
      const b = item.book;
      const formatType = item.format?.type || "EBOOK";
      const progressVal = item.progress ?? 0;
      const isCompleted = item.status === "COMPLETED" || progressVal >= 100;
      const status = isCompleted
        ? "COMPLETED"
        : progressVal > 0
          ? "READING"
          : "NOT_STARTED";

      return {
        id: b?.id || `item-${idx}`,
        orderItemId: item.orderItemId,
        title: b?.title || "Untitled Book",
        author:
          typeof b?.author === "string"
            ? b.author
            : b?.author?.profile?.firstName
              ? `${b.author.profile.firstName} ${b.author.profile.lastName || ""}`.trim()
              : b?.author?.username || "Unknown Author",
        rating:
          typeof b?.rating === "number"
            ? b.rating.toFixed(1)
            : b?.rating || "4.9",
        progress: progressVal,
        type: formatType,
        status,
        coverUrl:
          b?.bookCover ||
          b?.coverUrl ||
          b?.cover ||
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600",
      };
    },
  );

  // Filter books based on active tab
  const filteredMyBooks = libraryBooks.filter((book) => {
    if (activeTab === "All") return true;
    if (activeTab === "eBooks") return book.type === "EBOOK";
    if (activeTab === "Audiobooks") return book.type === "AUDIOBOOK";
    if (activeTab === "Completed")
      return book.status === "COMPLETED" || book.progress >= 100;
    return true;
  });

  const recentPurchases = libraryBooks.slice(0, 4);

  const recentlyOpened = libraryBooks.filter(
    (book) => book.progress > 0 || book.status === "READING",
  );

  // Recommended books from API
  const apiRecommended =
    (
      recommendedRes as unknown as {
        data?: {
          books?: Array<{
            id: string;
            title: string;
            author?: {
              username?: string;
              profile?: { firstName?: string; lastName?: string };
            };
            bookCover?: string;
            coverUrl?: string;
          }>;
        };
      }
    )?.data?.books ||
    (Array.isArray(recommendedRes)
      ? recommendedRes
      : (
          recommendedRes as unknown as {
            data?: Array<{
              id: string;
              title: string;
              author?: {
                username?: string;
                profile?: { firstName?: string; lastName?: string };
              };
              bookCover?: string;
              coverUrl?: string;
            }>;
          }
        )?.data) ||
    [];

  const recommendedBooks = apiRecommended.map((b) => ({
    id: b.id,
    title: b.title || "Untitled Book",
    author: b.author?.profile?.firstName
      ? `${b.author.profile.firstName} ${b.author.profile.lastName || ""}`.trim()
      : b.author?.username || "Unknown Author",
    coverUrl:
      b.bookCover ||
      b.coverUrl ||
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600",
  }));

  const handleBookPress = (bookId: string, title: string) => {
    navigation.navigate("BookDetail", {
      book: {
        id: bookId,
        title,
        author: "Author",
        price: "Purchased",
        rating: "4.9",
      },
    });
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My Library</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLibraryLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Recent Purchases */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Purchases</Text>
            {recentPurchases.length > 0 ? (
              <View style={styles.gridContainer}>
                {recentPurchases.map((book, idx) => (
                  <TouchableOpacity
                    key={`${book.id}-${idx}`}
                    style={styles.bookCard}
                    onPress={() => handleBookPress(book.id, book.title)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.coverWrapper}>
                      <Image
                        source={{ uri: book.coverUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {book.author}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#EAB308" />
                      <Text style={styles.ratingText}>{book.rating}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="bag-handle-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Recent Purchases</Text>
                <Text style={styles.emptySubtitle}>
                  Books you purchase will appear here.
                </Text>
              </View>
            )}
          </View>

          {/* Section 2: My Books */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Books</Text>
            {filteredMyBooks.length > 0 ? (
              <View style={styles.gridContainer}>
                {filteredMyBooks.map((book, idx) => (
                  <TouchableOpacity
                    key={`${book.id}-my-${idx}`}
                    style={styles.bookCard}
                    onPress={() => handleBookPress(book.id, book.title)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.coverWrapper}>
                      <Image
                        source={{ uri: book.coverUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.progressCaption}>Reading progress</Text>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(book.progress, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {book.progress}% complete
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="library-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>
                  {activeTab === "All"
                    ? "Your Library is Empty"
                    : `No ${activeTab} Found`}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === "All"
                    ? "Explore our store and purchase books to start reading."
                    : `You don't have any ${activeTab.toLowerCase()} in your collection.`}
                </Text>
              </View>
            )}
          </View>

          {/* Section 3: Recently Opened */}
          {recentlyOpened.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Opened</Text>
              <View style={styles.recentlyOpenedList}>
                {recentlyOpened.map((item) => (
                  <View key={item.id} style={styles.openedCard}>
                    <Image
                      source={{ uri: item.coverUrl }}
                      style={styles.openedThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.openedInfo}>
                      <Text style={styles.openedTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.openedSubtitle}>
                        {item.type === "AUDIOBOOK" ? "Audiobook" : "Book"} •{" "}
                        {item.progress}% complete
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.continueBtn}
                      onPress={() => handleBookPress(item.id, item.title)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.continueText}>CONTINUE</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Section 4: Recommended For You */}
          {recommendedBooks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recommended For You</Text>
              </View>

              <View style={styles.gridContainer}>
                {recommendedBooks.slice(0, 4).map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bookCard}
                    onPress={() => handleBookPress(b.id, b.title)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.coverWrapper}>
                      <Image
                        source={{ uri: b.coverUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {b.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {b.author}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ImageBackground>
  );
}

const DARK_GREEN = "#134E4A";
const ACCENT_GOLD = "#C6A34F";

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(251, 249, 244, 0.75)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 54,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#52635C",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3531",
    fontFamily: "serif",
  },

  tabsContainer: {
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#F3EEE5",
  },
  tabPillActive: {
    backgroundColor: ACCENT_GOLD,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  section: {
    marginTop: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3531",
    fontFamily: "serif",
    marginBottom: Spacing.sm,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },
  bookCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F0EBE1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  coverWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#EFECE6",
    marginBottom: 8,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },

  progressCaption: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#EBE5D8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: DARK_GREEN,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#6B7280",
  },

  recentlyOpenedList: {
    gap: Spacing.sm,
  },
  openedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F0EBE1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  openedThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#EFECE6",
  },
  openedInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  openedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  openedSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: ACCENT_GOLD,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  continueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0EBE1",
    borderStyle: "dashed",
    marginVertical: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
