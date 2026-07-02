import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";

const wishlistItems = [
  {
    id: "1",
    title: "The Hunger Games",
    rating: "4.6",
    reviews: "86 Reviews",
    price: "$100.00",
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    rating: "4.6",
    reviews: "86 Reviews",
    price: "$100.00",
  },
  {
    id: "3",
    title: "The Great Gatsby",
    rating: "4.6",
    reviews: "86 Reviews",
    price: "$100.00",
  },
];

export function WishlistScreen() {
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
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <View style={styles.backBtn} />
      </View>
      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.thumbnail}>
              <Ionicons name="book" size={28} color={Colors.secondary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={Colors.secondary} />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.reviews}>({item.reviews})</Text>
              </View>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.heartBtn}>
              <Ionicons name="heart" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
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
  topBarTitle: { ...Typography.h2, color: Colors.black },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: {
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
  thumbnail: {
    width: 56,
    height: 76,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, marginLeft: Spacing.md },
  title: { ...Typography.body, fontWeight: "600", color: Colors.black },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rating: { ...Typography.bodySmall, fontWeight: "600", color: Colors.black },
  reviews: { ...Typography.caption, color: Colors.gray[500] },
  price: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 4,
  },
  heartBtn: { padding: Spacing.sm },
});
