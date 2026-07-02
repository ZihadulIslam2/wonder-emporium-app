import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import homepageImg from "../../../assets/images/homepage.png";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";

type HomeNav = NativeStackNavigationProp<HomeStackParamList, "HomeScreen">;

const categories = [
  "Leadership",
  "Business",
  "Personal Growth",
  "Faith",
  "Health",
  "Finance",
];

const books = [
  {
    id: "1",
    title: "The Lantern of Quiet Hours",
    author: "Eleanor Whitfield",
    price: "$24.99",
    rating: "4.8",
    originalPrice: "$32.00",
  },
  {
    id: "2",
    title: "The Garden Within",
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
  {
    id: "4",
    title: "The Garden Within",
    author: "Marcus Aldridge",
    price: "$18.99",
    rating: "4.9",
  },
];

const authors = [
  { id: "1", name: "Sofia Renner", books: "12 Books", rating: "4.9" },
  { id: "2", name: "Daniel Okafor", books: "12 Books", rating: "4.9" },
];

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: string;
  rating: string;
  onPress?: () => void;
}

function BookCard({ title, author, price, rating, onPress }: BookCardProps) {
  return (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.bookCover}>
        <Ionicons name="book" size={32} color={Colors.secondary} />
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

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();

  const handleBookPress = (book: (typeof books)[number]) => {
    navigation.navigate("BookDetail", { book });
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.slogan}>
            Stories That Inspire,{"\n"}Teach & Transform
          </Text>
          <Text style={styles.headerSubtitle}>
            Inspiring books, audiobooks, and timeless wisdom curated for
            lifelong learners.
          </Text>
          <Image
            source={homepageImg}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors, audiobooks..."
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.contentSection}>
          <SectionHeader title="Categories" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((cat) => {
              const isSelected = cat === "Leadership";
              return (
                <TouchableIndicator
                  key={cat}
                  label={cat}
                  selected={isSelected}
                />
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <SectionHeader title="Featured Books" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onPress={() => handleBookPress(book)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <SectionHeader title="Popular Audiobook" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onPress={() => handleBookPress(book)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <SectionHeader title="Meet Future Founding Authors" />
          <View style={styles.authorsRow}>
            {authors.map((author) => (
              <View key={author.id} style={styles.authorCard}>
                <View style={styles.authorAvatar}>
                  <Ionicons name="person" size={28} color={Colors.secondary} />
                </View>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.authorBooks}>{author.books}</Text>
                <View style={styles.authorRating}>
                  <Ionicons name="star" size={12} color={Colors.secondary} />
                  <Text style={styles.authorRatingText}>{author.rating}</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                  <Text style={styles.profileBtnText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.contentSection}>
          <SectionHeader title="Recommended For You" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onPress={() => handleBookPress(book)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function TouchableIndicator({
  label,
  selected,
}: {
  label: string;
  selected?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    backgroundColor: DARK_GREEN,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  slogan: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
    fontFamily: "serif",
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.black,
    padding: 0,
  },
  contentSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
  chipsRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FEF3C7",
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.black,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: Colors.black,
  },
  carouselRow: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  bookCard: {
    width: 150,
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
    height: 140,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
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
  },
  authorName: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.black,
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
    paddingHorizontal: 20,
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
});
