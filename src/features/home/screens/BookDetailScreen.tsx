import { useState } from "react";
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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";

type Props = NativeStackScreenProps<HomeStackParamList, "BookDetail">;

const formats = ["eBook", "Paperback", "Audiobook", "Hardcover"];
const categories = ["Leadership", "Business", "Faith", "Personal Growth"];
const popularBooks = [
  {
    id: "1",
    title: "The Quiet Leader",
    author: "Marcus Aldridge",
    price: "$18.99",
    rating: "4.9",
  },
  {
    id: "2",
    title: "The Quiet Leader",
    author: "Marcus Aldridge",
    price: "$18.99",
    rating: "4.9",
  },
  {
    id: "3",
    title: "The Quiet Leader",
    author: "Marcus Aldridge",
    price: "$18.99",
    rating: "4.9",
  },
];

function BookCardSm({
  title,
  author,
  price,
  rating,
}: {
  title: string;
  author: string;
  price: string;
  rating: string;
}) {
  return (
    <View style={styles.smBookCard}>
      <View style={styles.smBookCover}>
        <Ionicons name="book" size={24} color={Colors.secondary} />
      </View>
      <Text style={styles.smBookTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.smBookAuthor} numberOfLines={1}>
        {author}
      </Text>
      <View style={styles.smBookFooter}>
        <Text style={styles.smBookPrice}>{price}</Text>
        <View style={styles.smRatingBadge}>
          <Ionicons name="star" size={9} color={Colors.white} />
          <Text style={styles.smRatingText}>{rating}</Text>
        </View>
      </View>
    </View>
  );
}

export function BookDetailScreen({ route, navigation }: Props) {
  const { book } = route.params;
  const [selectedFormat, setSelectedFormat] = useState("eBook");
  const [descExpanded, setDescExpanded] = useState(false);

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
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Book Details</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroImage}>
            <Ionicons name="book" size={64} color={Colors.secondary} />
          </View>
          <View style={styles.heroDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <View style={styles.authorRow}>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.secondary}
            />
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={16}
                  color={Colors.secondary}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.8 (2,341 reviews)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>$32.00</Text>
            <Text style={styles.currentPrice}>$24.99</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addToCartBtn}>
              <Text style={styles.addToCartText}>ADD TO CART</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyNowBtn}>
              <Text style={styles.buyNowText}>BUY NOW</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Description</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={descExpanded ? undefined : 4}
          >
            In a quiet village nestled between mist-laden hills, a young woman
            named Elara discovers an ancient lantern that holds the power to
            reveal hidden truths. As she embarks on a journey to uncover its
            origins, she finds herself entangled in a web of secrets, lost love,
            and the timeless battle between light and shadow. Eleanor Whitfield
            weaves a hauntingly beautiful tale of self-discovery and the quiet
            strength found in solitude.
          </Text>
          <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
            <Text style={styles.readMore}>
              {descExpanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Format</Text>
          <View style={styles.formatRow}>
            {formats.map((fmt) => (
              <TouchableOpacity
                key={fmt}
                style={[
                  styles.formatChip,
                  selectedFormat === fmt && styles.formatChipSelected,
                ]}
                onPress={() => setSelectedFormat(fmt)}
              >
                <Text
                  style={[
                    styles.formatChipText,
                    selectedFormat === fmt && styles.formatChipTextSelected,
                  ]}
                >
                  {fmt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Selection</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <View key={cat} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <InfoRow label="Language" value="English" />
          <InfoRow label="Pages" value="348" />
          <InfoRow label="ISBN" value="978-1-9821-4477-0" />
          <InfoRow label="Publication" value="March 12, 2024" />
          <InfoRow label="Format" value="eBook" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Author</Text>
          <View style={styles.authorProfile}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={32} color={Colors.secondary} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Eleanor Whitfield</Text>
              <Text style={styles.authorStat}>42 Books Published</Text>
              <View style={styles.foundingBadge}>
                <Text style={styles.foundingBadgeText}>Founding Author</Text>
              </View>
            </View>
          </View>
          <Text style={styles.authorBio}>
            Eleanor Whitfield is an award-winning novelist celebrated for her
            lyrical prose and deeply moving narratives. With over four decades
            of literary achievement, her works have been translated into 28
            languages and have sold millions worldwide.
          </Text>
          <TouchableOpacity style={styles.viewProfileBtn}>
            <Text style={styles.viewProfileText}>VIEW AUTHOR PROFILE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reader Reviews</Text>
            <Text style={styles.reviewsRating}>4.8</Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={14}
                  color={Colors.secondary}
                />
              ))}
            </View>
            <Text style={styles.reviewerName}>Sophia M.</Text>
            <Text style={styles.reviewText}>
              Absolutely loved this book! The storytelling is mesmerizing and
              the characters feel so real. Couldn't put it down.
            </Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={14}
                  color={Colors.secondary}
                />
              ))}
            </View>
            <Text style={styles.reviewerName}>James R.</Text>
            <Text style={styles.reviewText}>
              A beautifully written novel that stays with you long after you
              turn the last page.
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.viewAllReviews}>View All Reviews</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Audiobook</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularRow}
          >
            {popularBooks.map((b) => (
              <BookCardSm key={b.id} {...b} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const DARK_GREEN = "#1B4332";
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
  scrollContent: { paddingBottom: Spacing.xxl },

  heroSection: { alignItems: "center", paddingVertical: Spacing.lg },
  heroImage: {
    width: 200,
    height: 260,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroDots: { flexDirection: "row", gap: 6, marginTop: Spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  dotActive: { backgroundColor: Colors.secondary, width: 20 },

  infoSection: { paddingHorizontal: Spacing.lg },
  bookTitle: { ...Typography.h2, color: Colors.black },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  bookAuthor: { ...Typography.body, color: Colors.gray[500] },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stars: { flexDirection: "row", gap: 2 },
  ratingText: { ...Typography.caption, color: Colors.gray[500] },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  oldPrice: {
    ...Typography.body,
    color: Colors.gray[400],
    textDecorationLine: "line-through",
  },
  currentPrice: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
  },
  actionRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
  addToCartBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  addToCartText: {
    ...Typography.button,
    color: Colors.secondary,
    fontWeight: "700",
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  buyNowText: { ...Typography.button, color: Colors.white, fontWeight: "700" },

  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.black },
  descriptionText: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  readMore: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },

  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formatChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  formatChipSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: Colors.secondary,
  },
  formatChipText: { ...Typography.bodySmall, color: Colors.gray[600] },
  formatChipTextSelected: { color: Colors.black, fontWeight: "600" },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  categoryChipText: { ...Typography.caption, color: Colors.gray[600] },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  infoLabel: { ...Typography.body, color: Colors.gray[500] },
  infoValue: { ...Typography.body, color: Colors.black, fontWeight: "500" },

  authorProfile: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  authorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInfo: { flex: 1 },
  authorName: { ...Typography.h3, color: Colors.black, fontSize: 18 },
  authorStat: { ...Typography.caption, color: Colors.gray[500], marginTop: 2 },
  foundingBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  foundingBadgeText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: "600",
  },
  authorBio: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 24,
    marginTop: Spacing.md,
  },
  viewProfileBtn: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  viewProfileText: {
    ...Typography.button,
    color: Colors.secondary,
    fontWeight: "700",
  },

  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewsRating: { ...Typography.h2, color: Colors.secondary },
  reviewCard: { marginTop: Spacing.md },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewerName: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 4,
  },
  reviewText: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 22,
    marginTop: 2,
  },
  viewAllReviews: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
    marginTop: Spacing.md,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  viewAll: { ...Typography.bodySmall, color: Colors.gray[500] },
  popularRow: { gap: Spacing.md, paddingRight: Spacing.lg },

  smBookCard: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  smBookCover: {
    height: 110,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  smBookTitle: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.black,
  },
  smBookAuthor: { fontSize: 11, color: Colors.gray[500], marginTop: 1 },
  smBookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  smBookPrice: { fontSize: 11, fontWeight: "600", color: Colors.secondary },
  smRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_GREEN,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    gap: 1,
  },
  smRatingText: { fontSize: 9, fontWeight: "600", color: Colors.white },
});
