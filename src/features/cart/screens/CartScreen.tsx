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
import { cartApi, bookApi } from "@/api";
import { useMemo } from "react";

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
});
