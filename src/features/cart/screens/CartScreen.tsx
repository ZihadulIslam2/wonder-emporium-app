import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, bookApi, authorApi } from "@/api";
import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CartStackParamList } from "@/navigation/MainNavigator";

type CartNav = NativeStackNavigationProp<CartStackParamList, "CartScreen">;

interface AuthorApiItem {
  id: string;
  username?: string;
  avatarUrl?: string;
  bookCount?: number;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

interface FormattedAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  books: string;
  rating: string;
}

interface CartItem {
  id: string;
  bookId: string;
  formatId?: string;
  quantity: number;
}

interface FormatApiItem {
  id: string;
  listPrice?: number;
  sellingPrice?: number;
}

interface FileApiItem {
  type: string;
  url: string;
}

interface BookApiItem {
  id: string;
  title?: string;
  sellingPrice?: number;
  bookCover?: string;
  coverUrl?: string;
  cover?: string;
  formats?: FormatApiItem[];
  files?: FileApiItem[];
}

interface EnrichedCartItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverUrl?: string;
}

export function CartScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation<CartNav>();

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return response.data;
    },
  });

  const cartItems: CartItem[] = cartData?.data?.items || cartData?.items || [];

  const { data: booksData, isLoading: isBooksLoading } = useQuery({
    queryKey: ["cart-books", cartItems.map((i: CartItem) => i.bookId)],
    queryFn: async () => {
      if (!cartItems.length) return [];
      const promises = cartItems.map((item: CartItem) =>
        bookApi.getById(item.bookId),
      );
      const results = await Promise.all(promises);
      return results.map((res) => res.data?.data || res.data);
    },
    enabled: cartItems.length > 0,
  });

  const { data: authorsData, isLoading: isAuthorsLoading } = useQuery({
    queryKey: ["authors", "founding"],
    queryFn: async () => {
      const res = await authorApi.getFoundingAuthors({ limit: 4 });
      return res.data;
    },
  });

  const foundingAuthors: FormattedAuthor[] = (
    authorsData?.data?.authors ||
    authorsData?.authors ||
    []
  ).map((a: AuthorApiItem) => ({
    id: a.id,
    name: a.profile?.firstName
      ? `${a.profile.firstName} ${a.profile.lastName}`
      : a.username || "Author",
    avatarUrl: a.profile?.avatarUrl || a.avatarUrl,
    books: a.bookCount
      ? `${a.bookCount} Book${a.bookCount > 1 ? "s" : ""}`
      : "0 Books",
    rating: "4.9",
  }));

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    if (!cartItems.length) return [];
    return cartItems.map((item: CartItem) => {
      const book = booksData?.find((b: BookApiItem) => b.id === item.bookId);
      const format = book?.formats?.find(
        (f: FormatApiItem) => f.id === item.formatId,
      );
      const price = format
        ? format.listPrice || format.sellingPrice || 0
        : book?.sellingPrice || 0;
      const coverUrl =
        book?.bookCover ||
        book?.coverUrl ||
        book?.cover ||
        book?.files?.find((f: FileApiItem) => f.type === "COVER")?.url;

      return {
        id: item.id,
        bookId: item.bookId,
        title: book?.title || "Book",
        price: price,
        quantity: item.quantity,
        coverUrl,
      };
    });
  }, [cartItems, booksData]);

  const subtotal = enrichedItems.reduce(
    (sum: number, item: EnrichedCartItem) => sum + item.price * item.quantity,
    0,
  );
  const delivery = enrichedItems.length > 0 ? 20 : 0;
  const total = subtotal + delivery;
  const isLoading = isCartLoading || isBooksLoading;

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
        <Text style={styles.topBarTitle}>Cart Page</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.itemsList}>
            {enrichedItems.map((item: EnrichedCartItem) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemThumbnail}>
                  {item.coverUrl ? (
                    <Image
                      source={{ uri: item.coverUrl }}
                      style={styles.itemThumbnailImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="book" size={28} color={Colors.secondary} />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemRating}>
                    Quantity: {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItemMutation.mutate(item.id)}
                  disabled={removeItemMutation.isPending}
                >
                  <Ionicons name="close" size={18} color={Colors.gray[400]} />
                </TouchableOpacity>
              </View>
            ))}

            {enrichedItems.length === 0 && (
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            )}
          </View>

          {enrichedItems.length > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              enrichedItems.length === 0 && styles.disabledBtn,
            ]}
            disabled={enrichedItems.length === 0}
          >
            <Text style={styles.checkoutText}>Checkout Now</Text>
          </TouchableOpacity>

          {/* Meet Future Founding Authors Section */}
          <View style={styles.authorsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Meet Future Founding Authors
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AuthorsList", {
                    title: "Future Founding Authors",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {isAuthorsLoading ? (
              <View style={{ padding: Spacing.md, alignItems: "center" }}>
                <ActivityIndicator size="small" color={Colors.secondary} />
              </View>
            ) : (
              <View style={styles.authorsRow}>
                {foundingAuthors.map((author) => (
                  <TouchableOpacity
                    key={author.id}
                    style={styles.authorCard}
                    onPress={() =>
                      navigation.navigate("AuthorProfile", {
                        authorId: author.id,
                        authorName: author.name,
                        avatarUrl: author.avatarUrl,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.authorAvatar}>
                      {author.avatarUrl ? (
                        <Image
                          source={{ uri: author.avatarUrl }}
                          style={styles.authorAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="person"
                          size={28}
                          color={Colors.secondary}
                        />
                      )}
                    </View>
                    <Text style={styles.authorName} numberOfLines={1}>
                      {author.name}
                    </Text>
                    <Text style={styles.authorBooks}>{author.books}</Text>
                    <View style={styles.authorRating}>
                      <Ionicons
                        name="star"
                        size={12}
                        color={Colors.secondary}
                      />
                      <Text style={styles.authorRatingText}>
                        {author.rating}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.profileBtn}
                      onPress={() =>
                        navigation.navigate("AuthorProfile", {
                          authorId: author.id,
                          authorName: author.name,
                          avatarUrl: author.avatarUrl,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.profileBtnText}>View Profile</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
                {foundingAuthors.length === 0 && (
                  <Text style={styles.emptyAuthorsText}>No authors found.</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
    color: Colors.gray[500],
    marginTop: Spacing.xl,
  },

  itemsList: { gap: Spacing.md },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemThumbnail: {
    width: 56,
    height: 72,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemTitle: { ...Typography.body, fontWeight: "600", color: Colors.black },
  itemRating: { ...Typography.caption, color: Colors.gray[500], marginTop: 2 },
  itemPrice: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 4,
  },
  removeBtn: { padding: Spacing.sm },

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  summaryValue: { ...Typography.body, color: Colors.black },
  summaryLabel: { ...Typography.body, color: Colors.gray[500] },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: { ...Typography.h3, color: Colors.black },
  totalValue: { ...Typography.h3, color: Colors.secondary },

  checkoutBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  checkoutText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
  },

  authorsSection: {
    marginTop: Spacing.xl,
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
  authorsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  authorCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  authorAvatarImage: {
    width: "100%",
    height: "100%",
  },
  authorName: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "center",
  },
  authorBooks: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  authorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  authorRatingText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.secondary,
  },
  profileBtn: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: Spacing.sm,
    width: "100%",
    alignItems: "center",
  },
  profileBtnText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.black,
  },
  emptyAuthorsText: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    padding: Spacing.md,
    fontStyle: "italic",
  },
});
