import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/MainNavigator";

const menuSections = [
  {
    items: [{ label: "Reading Challenges", icon: "trophy-outline" as const }],
  },
  {
    heading: "Account",
    items: [
      { label: "Account Information", icon: "person-circle-outline" as const },
      { label: "Change Password", icon: "lock-closed-outline" as const },
      { label: "My Library", icon: "library-outline" as const },
    ],
  },
  {
    heading: "Support",
    items: [
      { label: "Help Center", icon: "help-buoy-outline" as const },
      { label: "About App", icon: "information-circle-outline" as const },
    ],
  },
];

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await authApi.getProfile();
      return response.data;
    },
  });

  const profile = profileData || {
    userProfile: { firstName: "Sarah", lastName: "Jenkins" },
    email: "sarah.j@example.app",
    username: "sarahj",
  };

  const name = profile.userProfile?.firstName
    ? `${profile.userProfile.firstName} ${profile.userProfile.lastName || ""}`
    : profile.username || "User";

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#134E4A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
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
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.secondary} />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>

          <View style={styles.menu}>
            {menuSections.map((section, sIdx) => (
              <View key={sIdx}>
                {section.heading && (
                  <Text style={styles.sectionHeading}>
                    {section.heading.toUpperCase()}
                  </Text>
                )}
                <View style={styles.menuCard}>
                  {section.items.map((item, iIdx) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.menuItem,
                        iIdx < section.items.length - 1 &&
                          styles.menuItemBorder,
                      ]}
                      activeOpacity={0.6}
                      onPress={() => {
                        if (item.label === "My Library") {
                          navigation.navigate("MyLibraryScreen");
                        }
                      }}
                    >
                      <View style={styles.menuLeft}>
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={Colors.gray[500]}
                        />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.gray[400]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#134E4A",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: { ...Typography.h2, color: "#134E4A" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxl },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileSection: { alignItems: "center", paddingVertical: Spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  name: { ...Typography.h2, color: Colors.black },
  email: { ...Typography.body, color: Colors.gray[500], marginTop: 4 },

  menu: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  sectionHeading: {
    ...Typography.caption,
    color: Colors.gray[500],
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[50],
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  menuLabel: { ...Typography.body, color: Colors.black },

  logoutBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
  },
  logoutText: { ...Typography.button, color: "#EF4444", fontWeight: "700" },
});
