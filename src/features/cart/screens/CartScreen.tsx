import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";

const cartItems = [
  {
    id: "1",
    title: "The Hunger Games",
    rating: "4.6 (86 Reviews)",
    price: "$100.00",
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    rating: "4.6 (86 Reviews)",
    price: "$100.00",
  },
  {
    id: "3",
    title: "The Great Gatsby",
    rating: "4.6 (86 Reviews)",
    price: "$100.00",
  },
];

export function CartScreen() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price.replace("$", "")),
    0,
  );
  const delivery = 20;
  const total = subtotal + delivery;

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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.itemsList}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemThumbnail}>
                <Ionicons name="book" size={28} color={Colors.secondary} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemRating}>{item.rating}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn}>
                <Ionicons name="close" size={18} color={Colors.gray[400]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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

        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Checkout Now</Text>
        </TouchableOpacity>
      </ScrollView>
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
  checkoutText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
  },
});
