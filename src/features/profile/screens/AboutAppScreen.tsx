import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useNavigation } from "@react-navigation/native";

export function AboutAppScreen() {
  const navigation = useNavigation();

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [modalType, setModalType] = useState<
    "terms" | "privacy" | "licenses" | null
  >(null);

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateMessage("");
    globalThis.setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateMessage(
        "You are using the latest version of Wonder Emporium (v1.0.0).",
      );
      globalThis.setTimeout(() => setUpdateMessage(""), 4000);
    }, 1500);
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Branding Card */}
        <View style={styles.brandCard}>
          <View style={styles.logoBadge}>
            <Ionicons name="book" size={40} color="#D97706" />
          </View>
          <Text style={styles.appName}>Wonder Emporium</Text>
          <Text style={styles.tagline}>
            Where Readers & Founding Authors Connect
          </Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0 • Build 2026.1</Text>
          </View>

          {/* Update Check Status */}
          {checkingUpdate ? (
            <View style={styles.updateStatusBox}>
              <ActivityIndicator size="small" color="#134E4A" />
              <Text style={styles.updateStatusText}>
                Checking for updates...
              </Text>
            </View>
          ) : updateMessage ? (
            <View style={styles.updateSuccessBox}>
              <Ionicons name="checkmark-circle" size={18} color="#065F46" />
              <Text style={styles.updateSuccessText}>{updateMessage}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.checkUpdateBtn}
              onPress={handleCheckUpdate}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color="#134E4A" />
              <Text style={styles.checkUpdateText}>Check for Updates</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Platform Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>ABOUT THE PLATFORM</Text>
          <Text style={styles.bodyText}>
            Wonder Emporium is a modern digital library and publishing platform
            designed to empower independent authors and book lovers alike. Enjoy
            seamless e-book reading, crisp audiobooks, and direct support for
            Founding Authors.
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>LEGAL & COMMUNITY</Text>

          {/* Terms of Service */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setModalType("terms")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={Colors.gray[600]}
              />
              <Text style={styles.menuLabel}>Terms of Service</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.gray[400]}
            />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuBorder]}
            onPress={() => setModalType("privacy")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={Colors.gray[600]}
              />
              <Text style={styles.menuLabel}>Privacy Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.gray[400]}
            />
          </TouchableOpacity>

          {/* Licenses */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuBorder]}
            onPress={() => setModalType("licenses")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="code-slash-outline"
                size={22}
                color={Colors.gray[600]}
              />
              <Text style={styles.menuLabel}>Open Source Licenses</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.gray[400]}
            />
          </TouchableOpacity>

          {/* Rate Us */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuBorder]}
            onPress={() => Linking.openURL("https://wonderemporium.com")}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="star-outline"
                size={22}
                color={Colors.gray[600]}
              />
              <Text style={styles.menuLabel}>Rate Wonder Emporium</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>
            © 2026 Wonder Emporium Inc. All rights reserved.
          </Text>
          <Text style={styles.craftedText}>
            Crafted with passion for readers world-wide.
          </Text>
        </View>
      </ScrollView>

      {/* Info Detail Modal */}
      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "terms"
                  ? "Terms of Service"
                  : modalType === "privacy"
                    ? "Privacy Policy"
                    : "Open Source Licenses"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalType(null)}
                style={styles.closeModalBtn}
              >
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {modalType === "terms" && (
                <Text style={styles.legalText}>
                  Welcome to Wonder Emporium. By using our application, mobile
                  app, or digital store services, you agree to comply with our
                  Terms of Service. All content, audiobooks, and e-books are
                  protected by international copyright laws. Unlawful
                  distribution, resale, or reproduction is strictly prohibited.
                </Text>
              )}
              {modalType === "privacy" && (
                <Text style={styles.legalText}>
                  Your privacy is extremely important to us. Wonder Emporium
                  encrypts account credentials and payment processing tokens. We
                  do not sell your personal reading data to third parties. We
                  store essential cookies and tokens to keep you logged in
                  securely.
                </Text>
              )}
              {modalType === "licenses" && (
                <Text style={styles.legalText}>
                  Wonder Emporium is built with React Native, Expo, TanStack
                  Query, and Axios. Special thanks to the open-source software
                  community for enabling world-class cross-platform application
                  development.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
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
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  brandCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  appName: { ...Typography.h1, color: "#134E4A", fontSize: 24 },
  tagline: {
    ...Typography.body,
    color: Colors.gray[600],
    textAlign: "center",
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  versionText: { fontSize: 12, fontWeight: "600", color: Colors.gray[600] },

  checkUpdateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: Spacing.md,
    gap: 6,
  },
  checkUpdateText: { fontSize: 13, fontWeight: "700", color: "#134E4A" },

  updateStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: 8,
  },
  updateStatusText: { fontSize: 13, color: "#134E4A", fontWeight: "600" },

  updateSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: Spacing.md,
    gap: 6,
  },
  updateSuccessText: { fontSize: 12, color: "#065F46", fontWeight: "600" },

  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeading: {
    ...Typography.caption,
    fontWeight: "700",
    color: Colors.gray[500],
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  bodyText: { ...Typography.body, color: Colors.gray[700], lineHeight: 22 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  menuBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuLabel: { ...Typography.body, color: Colors.black, fontWeight: "500" },

  footer: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  copyrightText: { fontSize: 12, color: Colors.gray[500] },
  craftedText: { fontSize: 11, color: Colors.gray[400], marginTop: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  modalTitle: { ...Typography.h2, color: "#134E4A" },
  closeModalBtn: { padding: 4 },
  modalScroll: { marginTop: Spacing.sm },
  legalText: { ...Typography.body, color: Colors.gray[700], lineHeight: 24 },
});
