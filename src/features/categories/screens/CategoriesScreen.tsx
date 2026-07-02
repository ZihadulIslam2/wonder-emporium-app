import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";

const categories = [
  {
    name: "Leadership",
    desc: "Modern leaders and strategy.",
    icon: "trending-up" as const,
    color: "#D4A574",
  },
  {
    name: "Business",
    desc: "Growth, finance, and ideas.",
    icon: "briefcase" as const,
    color: "#8B9D77",
  },
  {
    name: "Faith & Wisdom",
    desc: "Reflective reads for clarity.",
    icon: "star" as const,
    color: "#B8A07A",
  },
  {
    name: "Personal Growth",
    desc: "Habits, mindset, and change.",
    icon: "leaf" as const,
    color: "#7D9B7A",
  },
  {
    name: "Biography",
    desc: "Lives that shaped history.",
    icon: "person" as const,
    color: "#C49A6C",
  },
  {
    name: "Fiction",
    desc: "Immersive stories and worlds.",
    icon: "book" as const,
    color: "#9B8B7A",
  },
  {
    name: "Non-Fiction",
    desc: "Practical knowledge and insight.",
    icon: "bookmarks" as const,
    color: "#A89375",
  },
  {
    name: "Children's Books",
    desc: "Stories for young readers.",
    icon: "happy" as const,
    color: "#B5A07A",
  },
];

export function CategoriesScreen() {
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
        <Text style={styles.topBarTitle}>Categories</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.grid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={styles.card}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: cat.color + "20" }]}
            >
              <Ionicons name={cat.icon} size={24} color={cat.color} />
            </View>
            <Text style={styles.cardTitle}>{cat.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {cat.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.md,
    gap: Spacing.md,
    flex: 1,
    alignContent: "flex-start",
    paddingTop: Spacing.lg,
  },
  card: {
    width: "46%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.caption,
    color: Colors.gray[500],
    lineHeight: 18,
  },
});
