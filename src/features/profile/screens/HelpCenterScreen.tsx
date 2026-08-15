import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useNavigation } from "@react-navigation/native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    category: "Reading & Library",
    question: "How do I access my purchased e-books and audiobooks?",
    answer:
      "All purchased items automatically sync to your account. Go to the 'Profile' tab and tap 'My Library' to view and stream/read all your digital content anytime.",
  },
  {
    id: "2",
    category: "Reading & Library",
    question: "Can I download books for offline reading?",
    answer:
      "Yes! In 'My Library', tap the download icon next to any book or audiobook to save it locally for offline enjoyment.",
  },
  {
    id: "3",
    category: "Orders & Shipping",
    question: "How long does print-on-demand physical book delivery take?",
    answer:
      "Physical books are custom-printed upon ordering. Production typically takes 1-3 business days, and standard shipping takes 3-7 business days depending on your location.",
  },
  {
    id: "4",
    category: "Orders & Shipping",
    question: "Can I track my physical order status?",
    answer:
      "Yes, once your order is dispatched, you will receive an email notification containing your tracking code and carrier link.",
  },
  {
    id: "5",
    category: "Account & Payments",
    question: "What payment methods are supported?",
    answer:
      "We accept major credit/debit cards (Visa, MasterCard, Amex), Apple Pay, Google Pay, and store credit.",
  },
  {
    id: "6",
    category: "Account & Payments",
    question: "How do I request a refund?",
    answer:
      "Unopened physical books can be returned within 14 days. Digital items are non-refundable once downloaded, but if you experience technical issues, contact our support team immediately.",
  },
  {
    id: "7",
    category: "Founding Authors",
    question: "How can authors apply to become a Founding Author?",
    answer:
      "Authors can apply through our Author Portal. Visit wonderemporium.com/authors or contact author-support@wonderemporium.com.",
  },
];

const GUIDES = [
  {
    id: "g1",
    title: "Audiobook Player Features",
    desc: "Learn how to use sleep timer, playback speed control, and chapter navigation.",
    icon: "headset-outline" as const,
  },
  {
    id: "g2",
    title: "E-Reader Customization",
    desc: "Adjust theme, font size, margins, and night mode for the optimal reading experience.",
    icon: "book-outline" as const,
  },
  {
    id: "g3",
    title: "Wishlist & Recommendations",
    desc: "Save books to your wishlist and discover personalized reading suggestions.",
    icon: "heart-outline" as const,
  },
];

export function HelpCenterScreen() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<"faq" | "contact" | "guides">(
    "faq",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("1");

  // Contact form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        "Required Fields",
        "Please fill in both subject and message.",
      );
      return;
    }
    setContactSuccess(true);
    setSubject("");
    setMessage("");
    globalThis.setTimeout(() => setContactSuccess(false), 5000);
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
        <Text style={styles.topBarTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Banner */}
        <View style={styles.heroCard}>
          <Ionicons name="help-buoy-outline" size={40} color="#134E4A" />
          <Text style={styles.heroTitle}>How can we help you today?</Text>
          <Text style={styles.heroSub}>
            Search our knowledge base or get in touch with our customer care
            team.
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color={Colors.gray[400]}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help topics, FAQs..."
              placeholderTextColor={Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.gray[400]}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "faq" && styles.activeTabBtn]}
            onPress={() => setActiveTab("faq")}
          >
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={activeTab === "faq" ? "#FFFFFF" : "#134E4A"}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "faq" && styles.activeTabBtnText,
              ]}
            >
              FAQs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "contact" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("contact")}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={activeTab === "contact" ? "#FFFFFF" : "#134E4A"}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "contact" && styles.activeTabBtnText,
              ]}
            >
              Contact Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "guides" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("guides")}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color={activeTab === "guides" ? "#FFFFFF" : "#134E4A"}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "guides" && styles.activeTabBtnText,
              ]}
            >
              Guides
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQs View */}
        {activeTab === "faq" && (
          <View style={styles.contentSection}>
            {filteredFaqs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={Colors.gray[400]}
                />
                <Text style={styles.emptyTitle}>
                  No matching questions found
                </Text>
                <Text style={styles.emptySub}>
                  Try searching with different keywords or submit a message in
                  Contact Us.
                </Text>
              </View>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <TouchableOpacity
                    key={faq.id}
                    style={styles.faqCard}
                    onPress={() => toggleFaq(faq.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.faqHeader}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{faq.category}</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={Colors.gray[500]}
                      />
                    </View>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>

                    {isExpanded && (
                      <View style={styles.faqAnswerBox}>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Contact Support View */}
        {activeTab === "contact" && (
          <View style={styles.contentSection}>
            {/* Action Buttons */}
            <View style={styles.quickContactRow}>
              <TouchableOpacity
                style={styles.quickContactCard}
                onPress={() =>
                  Linking.openURL("mailto:support@wonderemporium.com")
                }
              >
                <View
                  style={[styles.contactIconBg, { backgroundColor: "#E0F2FE" }]}
                >
                  <Ionicons name="mail" size={24} color="#0284C7" />
                </View>
                <Text style={styles.quickTitle}>Email Support</Text>
                <Text style={styles.quickSub}>Reply within 24 hours</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickContactCard}
                onPress={() => Linking.openURL("tel:18005559663")}
              >
                <View
                  style={[styles.contactIconBg, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="call" size={24} color="#D97706" />
                </View>
                <Text style={styles.quickTitle}>Toll Free</Text>
                <Text style={styles.quickSub}>Mon-Fri 9am-6pm</Text>
              </TouchableOpacity>
            </View>

            {/* Message Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Send Us a Message</Text>
              <Text style={styles.formSub}>
                Have a question or issue? Leave a note and our team will get
                back to you.
              </Text>

              {contactSuccess && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#065F46" />
                  <Text style={styles.successText}>
                    Message sent successfully! Our team will respond shortly.
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Order Inquiry or App Issue"
                  placeholderTextColor={Colors.gray[400]}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: 100, textAlignVertical: "top", paddingTop: 10 },
                  ]}
                  placeholder="Describe your question or issue in detail..."
                  placeholderTextColor={Colors.gray[400]}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                />
              </View>

              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSendMessage}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sendBtnText}>Submit Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Guides View */}
        {activeTab === "guides" && (
          <View style={styles.contentSection}>
            {GUIDES.map((guide) => (
              <View key={guide.id} style={styles.guideCard}>
                <View style={styles.guideIconCircle}>
                  <Ionicons name={guide.icon} size={26} color="#134E4A" />
                </View>
                <View style={styles.guideInfo}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <Text style={styles.guideDesc}>{guide.desc}</Text>
                  <TouchableOpacity
                    style={styles.readMoreBtn}
                    onPress={() =>
                      Alert.alert(
                        guide.title,
                        `${guide.desc}\n\nFor more interactive tips, check out our online portal!`,
                      )
                    }
                  >
                    <Text style={styles.readMoreText}>Read Guide</Text>
                    <Ionicons name="arrow-forward" size={14} color="#134E4A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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

  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTitle: {
    ...Typography.h2,
    color: "#134E4A",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  heroSub: {
    ...Typography.caption,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    height: 44,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.body,
    color: Colors.black,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(19, 78, 74, 0.08)",
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTabBtn: { backgroundColor: "#134E4A" },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: "#134E4A" },
  activeTabBtnText: { color: Colors.white },

  contentSection: { gap: Spacing.md },

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyTitle: { ...Typography.h3, color: Colors.black, marginTop: Spacing.sm },
  emptySub: {
    ...Typography.caption,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 4,
  },

  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, fontWeight: "700", color: "#D97706" },
  faqQuestion: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 2,
  },
  faqAnswerBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  faqAnswer: { ...Typography.body, color: Colors.gray[600], lineHeight: 20 },

  quickContactRow: { flexDirection: "row", gap: Spacing.md },
  quickContactCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickTitle: { fontSize: 14, fontWeight: "700", color: Colors.black },
  quickSub: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },

  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: { ...Typography.h3, color: "#134E4A" },
  formSub: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
    marginBottom: Spacing.md,
  },

  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: Spacing.sm,
    borderRadius: 10,
    marginBottom: Spacing.md,
    gap: 8,
  },
  successText: { color: "#065F46", fontSize: 13, fontWeight: "600", flex: 1 },

  inputGroup: { marginBottom: Spacing.md },
  inputLabel: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.gray[700],
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    height: 44,
    ...Typography.body,
    color: Colors.black,
  },

  sendBtn: {
    flexDirection: "row",
    backgroundColor: "#134E4A",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  sendBtnText: { ...Typography.button, color: Colors.white, fontWeight: "700" },

  guideCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: "flex-start",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  guideIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  guideInfo: { flex: 1 },
  guideTitle: { ...Typography.h3, fontSize: 16, color: Colors.black },
  guideDesc: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 4,
    lineHeight: 18,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  readMoreText: { fontSize: 13, fontWeight: "700", color: "#134E4A" },
});
