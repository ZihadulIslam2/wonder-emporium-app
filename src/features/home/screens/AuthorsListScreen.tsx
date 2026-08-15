import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/MainNavigator";
import { useQuery } from "@tanstack/react-query";
import { authorApi } from "@/api";

type Props = NativeStackScreenProps<HomeStackParamList, "AuthorsList">;

interface AuthorApiItem {
  id: string;
  username?: string;
  avatarUrl?: string;
  bookCount?: number;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export function AuthorsListScreen({ route, navigation }: Props) {
  const { title } = route.params;

  const { data: authorsData, isLoading } = useQuery({
    queryKey: ["authors-list"],
    queryFn: async () => {
      const res = await authorApi.getFoundingAuthors({ limit: 20 });
      return res.data;
    },
  });

  const rawAuthors = authorsData?.data?.authors || authorsData?.authors || [];

  const authors = rawAuthors.map((a: AuthorApiItem) => ({
    id: a.id,
    name: a.profile?.firstName
      ? `${a.profile.firstName} ${a.profile.lastName}`
      : a.username,
    avatarUrl: a.profile?.avatarUrl || a.avatarUrl,
    books: a.bookCount
      ? `${a.bookCount} Book${a.bookCount > 1 ? "s" : ""}`
      : "0 Books",
    rating: "4.9",
    bio: a.profile?.bio || "Founding Author at Wonder Emporium",
  }));

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
        <Text style={styles.topBarTitle}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={authors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No authors found.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.authorCard}
              onPress={() =>
                navigation.navigate("AuthorProfile", {
                  authorId: item.id,
                  authorName: item.name,
                  authorBio: item.bio,
                  avatarUrl: item.avatarUrl,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={32} color={Colors.secondary} />
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.authorName}>{item.name}</Text>
                <Text style={styles.authorBio} numberOfLines={2}>
                  {item.bio}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.authorBooks}>{item.books}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={Colors.secondary} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
    color: Colors.gray[500],
    marginTop: Spacing.xl,
  },
  authorCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  authorName: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.black,
  },
  authorBio: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  authorBooks: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.black,
  },
});
