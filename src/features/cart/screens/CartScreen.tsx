import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, bookApi, authorApi, ordersApi } from "@/api";
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

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);

  const handleCheckout = async () => {
    if (!cartItems.length) return;

    try {
      setIsCheckingOut(true);

      const checkoutItems = cartItems
        .map((item) => {
          let fId = item.formatId;
          if (!fId) {
            const book = booksData?.find(
              (b: BookApiItem) => b.id === item.bookId,
            );
            fId = book?.formats?.[0]?.id;
          }
          return {
            formatId: fId || "",
            quantity: item.quantity || 1,
          };
        })
        .filter((item) => Boolean(item.formatId));

      if (!checkoutItems.length) {
        Alert.alert(
          "Checkout Error",
          "Could not identify the format of items in your cart. Please try re-adding them.",
        );
        return;
      }

      const res = await ordersApi.createCheckout({
        items: checkoutItems,
        successUrl:
          "https://wonder-emporium.onrender.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancelUrl: "https://wonder-emporium.onrender.com/checkout/cancel",
      });

      const resData =
        (
          res.data as unknown as {
            data?: { checkoutUrl?: string; sessionId?: string };
            checkoutUrl?: string;
            sessionId?: string;
          }
        )?.data ||
        (res.data as unknown as {
          checkoutUrl?: string;
          sessionId?: string;
        });

      const url = resData?.checkoutUrl;
      const sessionId = resData?.sessionId;

      if (!url) {
        Alert.alert("Checkout Error", "Could not create a checkout session.");
        return;
      }

      setCheckoutUrl(url);
      setCurrentSessionId(sessionId || null);
      setIsWebViewLoading(true);
      setIsModalOpen(true);
    } catch (error: unknown) {
      const err = error as Error & {
        response?: { data?: { message?: string | string[] } };
      };
      const rawMessage = err?.response?.data?.message || err?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join("\n")
        : typeof rawMessage === "string"
          ? rawMessage
          : "An error occurred while processing checkout.";
      Alert.alert("Checkout Error", message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCheckoutUrl(null);
    setCurrentSessionId(null);
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url } = navState;

    if (url.includes("/checkout/success") || url.includes("status=success")) {
      setIsModalOpen(false);
      setCheckoutUrl(null);

      // Extract session_id from URL query if returned by Stripe
      let sid = currentSessionId;
      try {
        const match = url.match(/[?&]session_id=([^&]+)/);
        if (match && match[1] && !match[1].startsWith("{")) {
          sid = match[1];
        }
      } catch {
        // ignore match error
      }
      setCurrentSessionId(null);

      // 1. Confirm session with backend to mark order COMPLETED and populate library
      if (sid) {
        try {
          await ordersApi.confirmCheckoutSession(sid);
        } catch {
          // Ignore confirmation failure (can be resolved asynchronously)
        }
      }

      // 2. Explicitly clear user's cart in client API
      try {
        await cartApi.clearCart();
      } catch {
        // Ignore clear cart failure
      }

      // 3. Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-books"] });
      queryClient.invalidateQueries({ queryKey: ["library"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      Alert.alert(
        "Order Placed",
        "Your order has been completed successfully! You can find your purchased books in your library.",
        [
          {
            text: "View My Library",
            onPress: () => {
              navigation
                .getParent<
                  NativeStackNavigationProp<{
                    Profile: { screen?: string };
                  }>
                >()
                ?.navigate("Profile", {
                  screen: "MyLibraryScreen",
                });
            },
          },
          { text: "OK", style: "cancel" },
        ],
      );
    } else if (
      url.includes("/checkout/cancel") ||
      url.includes("status=cancel")
    ) {
      setIsModalOpen(false);
      setCheckoutUrl(null);
      setCurrentSessionId(null);
    }
  };

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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
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
              (enrichedItems.length === 0 || isCheckingOut) &&
                styles.disabledBtn,
            ]}
            disabled={enrichedItems.length === 0 || isCheckingOut}
            onPress={handleCheckout}
            activeOpacity={0.8}
          >
            {isCheckingOut ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.checkoutText}>Checkout Now</Text>
            )}
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

      {/* In-App Native Stripe Checkout Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
            <View style={styles.modalTitleRow}>
              <Ionicons name="lock-closed" size={16} color={Colors.secondary} />
              <Text style={styles.modalHeaderTitle}>Secure Checkout</Text>
            </View>
            <View style={styles.modalCloseBtn} />
          </View>

          {isWebViewLoading && (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={Colors.secondary} />
              <Text style={styles.loaderText}>Loading Payment Portal...</Text>
            </View>
          )}

          {checkoutUrl && (
            <WebView
              source={{ uri: checkoutUrl }}
              onLoadEnd={() => setIsWebViewLoading(false)}
              onNavigationStateChange={handleNavigationStateChange}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: Colors.black,
    fontWeight: "700",
  },
  webViewLoader: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: Spacing.md,
  },
  loaderText: {
    ...Typography.bodySmall,
    color: Colors.gray[600],
    fontWeight: "600",
  },
  webView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
