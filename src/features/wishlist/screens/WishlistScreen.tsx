import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useWishlistStore, WishlistItem } from "@/store/wishlist.store";
import { useNavigation } from "@react-navigation/native";

export function WishlistScreen() {
  const navigation = useNavigation();
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const handleBookPress = (item: WishlistItem) => {
    (
      navigation as unknown as {
        navigate: (route: string, params?: unknown) => void;
      }
    ).navigate("Home", {
      screen: "BookDetail",
      params: { book: item },
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
        <View style={styles.backBtn} />
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <View style={styles.backBtn} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any book to add it to your wishlist.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl =
            item.bookCover ||
            item.coverUrl ||
            item.cover ||
            (
              item.files as Array<{ type: string; url: string }> | undefined
            )?.find((f) => f.type === "COVER")?.url;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleBookPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnail}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="book" size={28} color={Colors.secondary} />
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.author} numberOfLines={1}>
                  {item.author}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={Colors.secondary} />
                  <Text style={styles.rating}>{item.rating || "4.8"}</Text>
                </View>
                <Text style={styles.price}>{item.price || "Free"}</Text>
              </View>
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => removeFromWishlist(item.id)}
              >
                <Ionicons name="heart" size={24} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
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
  list: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
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
    width: 60,
    height: 80,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  info: { flex: 1, marginLeft: Spacing.md },
  title: { ...Typography.body, fontWeight: "600", color: Colors.black },
  author: { ...Typography.caption, color: Colors.gray[500], marginTop: 2 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rating: { ...Typography.caption, fontWeight: "600", color: Colors.black },
  price: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.secondary,
    marginTop: 4,
  },
  heartBtn: { padding: Spacing.sm },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.black,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
