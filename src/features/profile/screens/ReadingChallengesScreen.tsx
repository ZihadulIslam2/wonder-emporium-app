import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/MainNavigator";
import {
  useReadingChallengeStore,
  Trophy,
  TrophyTier,
} from "@/store/reading-challenge.store";
import { useReaderStore } from "@/store/reader.store";
import { useQuery } from "@tanstack/react-query";
import { libraryApi, LibraryItem } from "@/api";

type ProfileNav = NativeStackNavigationProp<
  ProfileStackParamList,
  "ReadingChallenges"
>;

const TIER_COLORS: Record<
  TrophyTier,
  { bg: string; border: string; text: string; icon: string }
> = {
  bronze: {
    bg: "#FEF3C7",
    border: "#F59E0B",
    text: "#B45309",
    icon: "#D97706",
  },
  silver: {
    bg: "#F1F5F9",
    border: "#94A3B8",
    text: "#475569",
    icon: "#64748B",
  },
  gold: { bg: "#FEF9C3", border: "#EAB308", text: "#A16207", icon: "#CA8A04" },
  diamond: {
    bg: "#E0F2FE",
    border: "#38BDF8",
    text: "#0369A1",
    icon: "#0284C7",
  },
};

export function ReadingChallengesScreen() {
  const navigation = useNavigation<ProfileNav>();

  const {
    isInitialized,
    annualTarget,
    monthlyTarget,
    customCompletedCount,
    completedBookIds,
    totalMinutesRead,
    currentStreak,
    trophies,
    initChallenge,
    setAnnualTarget,
    markBookCompleted,
    logManualBook,
    logReadingSession,
    syncWithReaderStore,
  } = useReadingChallengeStore();

  const progressMap = useReaderStore((state) => state.progressMap);
  const initProgress = useReaderStore((state) => state.initProgress);

  // Modals state
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = useState(false);
  const [tempTarget, setTempTarget] = useState(annualTarget);
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);
  const [isLogBookModalOpen, setIsLogBookModalOpen] = useState(false);
  const [manualBookTitle, setManualBookTitle] = useState("");
  const [trophyFilter, setTrophyFilter] = useState<
    "all" | "unlocked" | "locked"
  >("all");

  // Fetch owned library books to make completing books seamless
  const { data: libraryRes } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const res = await libraryApi.getLibrary();
      return res.data;
    },
  });

  const apiLibraryItems: LibraryItem[] = Array.isArray(libraryRes)
    ? libraryRes
    : (libraryRes as unknown as { data?: LibraryItem[] })?.data || [];

  useEffect(() => {
    initChallenge();
    initProgress();
  }, [initChallenge, initProgress]);

  // Synchronize when reader progress is available
  useEffect(() => {
    if (isInitialized && progressMap && Object.keys(progressMap).length > 0) {
      syncWithReaderStore(progressMap);
    }
  }, [isInitialized, progressMap, syncWithReaderStore]);

  const totalBooksCompleted = completedBookIds.length + customCompletedCount;
  const progressPercent = Math.min(
    100,
    Math.round((totalBooksCompleted / annualTarget) * 100) || 0,
  );
  const remainingBooks = Math.max(0, annualTarget - totalBooksCompleted);
  const unlockedTrophyCount = trophies.filter((t) => t.unlockedAt).length;

  const filteredTrophies = useMemo(() => {
    if (trophyFilter === "unlocked")
      return trophies.filter((t) => t.unlockedAt);
    if (trophyFilter === "locked") return trophies.filter((t) => !t.unlockedAt);
    return trophies;
  }, [trophies, trophyFilter]);

  const handleSaveTarget = () => {
    setAnnualTarget(tempTarget);
    setIsEditTargetModalOpen(false);
  };

  const handleManualBookSubmit = async () => {
    if (!manualBookTitle.trim()) {
      Alert.alert("Title Required", "Please enter a book title to log.");
      return;
    }
    const newlyUnlocked = await logManualBook(manualBookTitle.trim());
    setManualBookTitle("");
    setIsLogBookModalOpen(false);

    if (newlyUnlocked && newlyUnlocked.length > 0) {
      Alert.alert(
        "🏆 Trophy Unlocked!",
        `Congratulations! You earned "${newlyUnlocked[0].title}": ${newlyUnlocked[0].subtitle}`,
      );
    } else {
      Alert.alert(
        "Progress Logged!",
        "Great job! Keep the reading momentum going.",
      );
    }
  };

  const handleQuickLogLibraryBook = async (bookId: string, title: string) => {
    const newlyUnlocked = await markBookCompleted(bookId, 35);
    setIsLogBookModalOpen(false);

    if (newlyUnlocked && newlyUnlocked.length > 0) {
      Alert.alert(
        "🏆 Trophy Unlocked!",
        `Congratulations! You earned "${newlyUnlocked[0].title}": ${newlyUnlocked[0].subtitle}`,
      );
    } else {
      Alert.alert(
        "Book Finished!",
        `"${title}" has been added to your reading challenge!`,
      );
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reading Challenges</Text>
        <TouchableOpacity
          style={styles.topRightBtn}
          onPress={() => {
            setTempTarget(annualTarget);
            setIsEditTargetModalOpen(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Annual Challenge Card */}
        <View style={styles.heroChallengeCard}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroTitle}>Annual Book Quest</Text>
            <TouchableOpacity
              style={styles.editTargetBtn}
              onPress={() => {
                setTempTarget(annualTarget);
                setIsEditTargetModalOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={12} color={DARK_GREEN} />
              <Text style={styles.editTargetText}>Edit Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Big Progress Number Display */}
          <View style={styles.progressStatsRow}>
            <View>
              <Text style={styles.progressMainNumber}>
                {totalBooksCompleted}
                <Text style={styles.progressTargetNumber}>
                  {" "}
                  / {annualTarget}
                </Text>
              </Text>
              <Text style={styles.progressSubtitle}>
                {totalBooksCompleted >= annualTarget
                  ? "🎉 Challenge Surpassed!"
                  : `${remainingBooks} ${remainingBooks === 1 ? "book" : "books"} to reach your goal`}
              </Text>
            </View>
            <View style={styles.percentPill}>
              <Text style={styles.percentPillText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar with Milestone Markers */}
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>

          <View style={styles.heroFooterRow}>
            <View style={styles.paceIndicator}>
              <Ionicons
                name={
                  totalBooksCompleted >= annualTarget
                    ? "checkmark-circle"
                    : "flame"
                }
                size={14}
                color={
                  totalBooksCompleted >= annualTarget ? "#059669" : "#D97706"
                }
              />
              <Text style={styles.paceText}>
                {totalBooksCompleted >= annualTarget
                  ? "Target Accomplished!"
                  : totalBooksCompleted >= Math.round(annualTarget / 2)
                    ? "Ahead of Schedule! 🚀"
                    : "Pace: On Track"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logBookBtn}
              onPress={() => setIsLogBookModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={Colors.white} />
              <Text style={styles.logBookBtnText}>Log Finished Book</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[styles.statIconBadge, { backgroundColor: "#FEF3C7" }]}
            >
              <Ionicons name="book" size={18} color="#B45309" />
            </View>
            <Text style={styles.statValue}>{totalBooksCompleted}</Text>
            <Text style={styles.statLabel}>Books Read</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconBadge, { backgroundColor: "#FEE2E2" }]}
            >
              <Ionicons name="flame" size={18} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>{currentStreak} Days</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconBadge, { backgroundColor: "#E0E7FF" }]}
            >
              <Ionicons name="time" size={18} color="#4338CA" />
            </View>
            <Text style={styles.statValue}>
              {totalMinutesRead >= 60
                ? `${(totalMinutesRead / 60).toFixed(1)}h`
                : `${totalMinutesRead}m`}
            </Text>
            <Text style={styles.statLabel}>Reading Time</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconBadge, { backgroundColor: "#FEF9C3" }]}
            >
              <Ionicons name="trophy" size={18} color="#CA8A04" />
            </View>
            <Text style={styles.statValue}>
              {unlockedTrophyCount}/{trophies.length}
            </Text>
            <Text style={styles.statLabel}>Trophies Won</Text>
          </View>
        </View>

        {/* Monthly Sprint Section */}
        <View style={styles.sprintCard}>
          <View style={styles.sprintHeader}>
            <View style={styles.sprintTitleRow}>
              <Ionicons name="calendar-outline" size={18} color={DARK_GREEN} />
              <Text style={styles.sprintTitle}>Monthly Reading Sprint</Text>
            </View>
            <Text style={styles.sprintTargetText}>
              Target: {monthlyTarget} Books
            </Text>
          </View>
          <Text style={styles.sprintSubtitle}>
            Finish {monthlyTarget} books this month to keep your reading pace
            active.
          </Text>
          <View style={styles.sprintProgressBar}>
            <View
              style={[
                styles.sprintProgressFill,
                {
                  width: `${Math.min(
                    100,
                    Math.round(
                      (Math.min(monthlyTarget, totalBooksCompleted) /
                        monthlyTarget) *
                        100,
                    ),
                  )}%`,
                },
              ]}
            />
          </View>
          <View style={styles.sprintFooter}>
            <Text style={styles.sprintFooterText}>
              {Math.min(monthlyTarget, totalBooksCompleted)} of {monthlyTarget}{" "}
              completed
            </Text>
            <TouchableOpacity
              onPress={() => logReadingSession(20)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReadBtnText}>+20m Reading Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hall of Trophies Header & Filters */}
        <View style={styles.trophiesSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Hall of Trophies</Text>
            <Text style={styles.sectionSubtitle}>
              Earn prestigious awards as you conquer your targets
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.trophyFilterRow}>
          {(["all", "unlocked", "locked"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.trophyFilterPill,
                trophyFilter === filter && styles.trophyFilterPillActive,
              ]}
              onPress={() => setTrophyFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.trophyFilterText,
                  trophyFilter === filter && styles.trophyFilterTextActive,
                ]}
              >
                {filter === "all"
                  ? `All (${trophies.length})`
                  : filter === "unlocked"
                    ? `Unlocked (${unlockedTrophyCount})`
                    : `In Progress (${trophies.length - unlockedTrophyCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trophies Grid */}
        <View style={styles.trophiesGrid}>
          {filteredTrophies.map((trophy) => {
            const isUnlocked = Boolean(trophy.unlockedAt);
            const tierStyle = TIER_COLORS[trophy.tier];

            return (
              <TouchableOpacity
                key={trophy.id}
                style={[
                  styles.trophyCard,
                  isUnlocked
                    ? styles.trophyCardUnlocked
                    : styles.trophyCardLocked,
                ]}
                onPress={() => setSelectedTrophy(trophy)}
                activeOpacity={0.8}
              >
                {/* Tier Badge Header */}
                <View style={styles.trophyCardHeader}>
                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor: isUnlocked ? tierStyle.bg : "#F3F4F6",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        {
                          color: isUnlocked ? tierStyle.text : Colors.gray[500],
                        },
                      ]}
                    >
                      {trophy.tier.toUpperCase()}
                    </Text>
                  </View>
                  {isUnlocked ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#059669"
                    />
                  ) : (
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={Colors.gray[400]}
                    />
                  )}
                </View>

                {/* Trophy Big Symbol */}
                <View
                  style={[
                    styles.trophySymbolWrapper,
                    isUnlocked
                      ? {
                          backgroundColor: tierStyle.bg,
                          borderColor: tierStyle.border,
                        }
                      : styles.trophySymbolLocked,
                  ]}
                >
                  <Ionicons
                    name={
                      isUnlocked ? (trophy.icon as never) : "trophy-outline"
                    }
                    size={32}
                    color={isUnlocked ? tierStyle.icon : Colors.gray[400]}
                  />
                </View>

                <Text style={styles.trophyCardTitle} numberOfLines={1}>
                  {trophy.title}
                </Text>
                <Text style={styles.trophyCardSubtitle} numberOfLines={2}>
                  {trophy.subtitle}
                </Text>

                <View style={styles.trophyCardStatus}>
                  {isUnlocked ? (
                    <Text style={styles.unlockedDateText}>Unlocked! 🎉</Text>
                  ) : (
                    <Text style={styles.lockedConditionText}>
                      Target: {trophy.targetCount}{" "}
                      {trophy.metric === "streak"
                        ? "Days"
                        : trophy.metric === "targetPercent"
                          ? "%"
                          : trophy.metric === "audioMinutes"
                            ? "Mins"
                            : "Books"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Trophy Detail Popup Modal */}
      <Modal
        visible={Boolean(selectedTrophy)}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedTrophy(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.trophyModalContent}>
            {selectedTrophy && (
              <>
                <View
                  style={[
                    styles.modalTrophyBadge,
                    {
                      backgroundColor: selectedTrophy.unlockedAt
                        ? TIER_COLORS[selectedTrophy.tier].bg
                        : "#F3F4F6",
                      borderColor: selectedTrophy.unlockedAt
                        ? TIER_COLORS[selectedTrophy.tier].border
                        : Colors.gray[300],
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedTrophy.unlockedAt
                        ? (selectedTrophy.icon as never)
                        : "lock-closed"
                    }
                    size={48}
                    color={
                      selectedTrophy.unlockedAt
                        ? TIER_COLORS[selectedTrophy.tier].icon
                        : Colors.gray[500]
                    }
                  />
                </View>

                <Text style={styles.modalTrophyTier}>
                  {selectedTrophy.tier.toUpperCase()} TROPHY
                </Text>
                <Text style={styles.modalTrophyTitle}>
                  {selectedTrophy.title}
                </Text>
                <Text style={styles.modalTrophyDesc}>
                  {selectedTrophy.description}
                </Text>

                <View style={styles.modalTrophyStatusBox}>
                  <Ionicons
                    name={selectedTrophy.unlockedAt ? "ribbon" : "time-outline"}
                    size={16}
                    color={
                      selectedTrophy.unlockedAt ? "#059669" : Colors.gray[600]
                    }
                  />
                  <Text style={styles.modalTrophyStatusText}>
                    {selectedTrophy.unlockedAt
                      ? "Reward Earned & Added to Profile!"
                      : `Goal: ${selectedTrophy.subtitle}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedTrophy(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Target Goal Modal */}
      <Modal
        visible={isEditTargetModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditTargetModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editTargetModalContent}>
            <Text style={styles.editModalTitle}>Set Reading Goal</Text>
            <Text style={styles.editModalSubtitle}>
              How many books would you like to set as your goal?
            </Text>

            {/* Stepper Controls */}
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setTempTarget(Math.max(1, tempTarget - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={22} color={DARK_GREEN} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{tempTarget}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setTempTarget(tempTarget + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={22} color={DARK_GREEN} />
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <Text style={styles.presetLabel}>Quick Targets:</Text>
            <View style={styles.presetRow}>
              {[6, 12, 24, 52].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetPill,
                    tempTarget === preset && styles.presetPillActive,
                  ]}
                  onPress={() => setTempTarget(preset)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetPillText,
                      tempTarget === preset && styles.presetPillTextActive,
                    ]}
                  >
                    {preset} Books
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditTargetModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveTarget}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Set Target</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Log Book Finished Modal */}
      <Modal
        visible={isLogBookModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLogBookModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logBookModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.editModalTitle}>Log Finished Book</Text>
              <TouchableOpacity
                onPress={() => setIsLogBookModalOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.editModalSubtitle}>
              Choose from your library or type a title to mark as completed.
            </Text>

            {/* If user has books in their library, display quick select */}
            {apiLibraryItems.length > 0 && (
              <>
                <Text style={styles.presetLabel}>From Your Library:</Text>
                <ScrollView
                  style={{ maxHeight: 160, marginBottom: Spacing.md }}
                  nestedScrollEnabled
                >
                  {apiLibraryItems.map((item) => {
                    const isAlreadyLogged = completedBookIds.includes(
                      item.book.id,
                    );
                    const authorName =
                      typeof item.book.author === "string"
                        ? item.book.author
                        : item.book.author?.username || "Wonder Author";
                    return (
                      <TouchableOpacity
                        key={item.orderItemId || item.book.id}
                        style={[
                          styles.libraryBookRow,
                          isAlreadyLogged && styles.libraryBookRowDone,
                        ]}
                        onPress={() =>
                          !isAlreadyLogged &&
                          handleQuickLogLibraryBook(
                            item.book.id,
                            item.book.title,
                          )
                        }
                        disabled={isAlreadyLogged}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={styles.libraryBookTitle}
                            numberOfLines={1}
                          >
                            {item.book.title}
                          </Text>
                          <Text
                            style={styles.libraryBookAuthor}
                            numberOfLines={1}
                          >
                            {authorName}
                          </Text>
                        </View>
                        {isAlreadyLogged ? (
                          <View style={styles.loggedPill}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="#059669"
                            />
                            <Text style={styles.loggedPillText}>Completed</Text>
                          </View>
                        ) : (
                          <Text style={styles.markCompleteText}>
                            + Mark Complete
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Custom Book Title Input */}
            <Text style={styles.presetLabel}>Or Type Any Book Title:</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="e.g. The Hobbit, Atomic Habits..."
              placeholderTextColor={Colors.gray[400]}
              value={manualBookTitle}
              onChangeText={setManualBookTitle}
            />

            <TouchableOpacity
              style={styles.submitManualBtn}
              onPress={handleManualBookSubmit}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.white}
              />
              <Text style={styles.submitManualText}>Add to My Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const DARK_GREEN = "#1B4332";

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === "ios" ? 56 : 48,
    paddingBottom: Spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  topBarTitle: { ...Typography.h3, color: Colors.black, fontSize: 18 },
  topRightBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
  },

  // Hero Challenge Card
  heroChallengeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "rgba(217, 119, 6, 0.2)",
    shadowColor: DARK_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: Spacing.lg,
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    ...Typography.h2,
    fontSize: 22,
    color: DARK_GREEN,
  },
  editTargetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(27, 67, 50, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editTargetText: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK_GREEN,
  },
  progressStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  progressMainNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: DARK_GREEN,
  },
  progressTargetNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  progressSubtitle: {
    ...Typography.caption,
    color: Colors.gray[600],
    marginTop: 2,
    fontWeight: "500",
  },
  percentPill: {
    backgroundColor: DARK_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  percentPillText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
    marginVertical: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#D97706",
    borderRadius: 6,
  },
  heroFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  paceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  paceText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[700],
  },
  logBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: DARK_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logBookBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // 4 Stats Grid
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.black,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },

  // Sprint Card
  sprintCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sprintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sprintTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sprintTitle: {
    ...Typography.body,
    fontWeight: "700",
    color: DARK_GREEN,
  },
  sprintTargetText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: "700",
  },
  sprintSubtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  sprintProgressBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  sprintProgressFill: {
    height: "100%",
    backgroundColor: DARK_GREEN,
    borderRadius: 4,
  },
  sprintFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sprintFooterText: {
    fontSize: 11,
    color: Colors.gray[600],
    fontWeight: "600",
  },
  quickReadBtnText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: "700",
  },

  // Trophies Section
  trophiesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: DARK_GREEN,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 2,
  },
  trophyFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.md,
  },
  trophyFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  trophyFilterPillActive: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },
  trophyFilterText: {
    fontSize: 12,
    color: Colors.gray[600],
    fontWeight: "600",
  },
  trophyFilterTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },

  // Trophies Grid
  trophiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  trophyCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  trophyCardUnlocked: {
    borderColor: "rgba(217, 119, 6, 0.3)",
    backgroundColor: "#FFFFFF",
  },
  trophyCardLocked: {
    borderColor: "rgba(0, 0, 0, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  trophyCardHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  trophySymbolWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginVertical: Spacing.sm,
  },
  trophySymbolLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: Colors.gray[200],
  },
  trophyCardTitle: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
  },
  trophyCardSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 2,
    height: 32,
  },
  trophyCardStatus: {
    marginTop: Spacing.xs,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    width: "100%",
    alignItems: "center",
  },
  unlockedDateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  lockedConditionText: {
    fontSize: 10,
    color: Colors.gray[500],
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  trophyModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTrophyBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  modalTrophyTier: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.gray[500],
    letterSpacing: 1,
  },
  modalTrophyTitle: {
    ...Typography.h2,
    fontSize: 22,
    color: DARK_GREEN,
    marginTop: 4,
    textAlign: "center",
  },
  modalTrophyDesc: {
    ...Typography.bodySmall,
    color: Colors.gray[600],
    textAlign: "center",
    lineHeight: 20,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modalTrophyStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  modalTrophyStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[700],
  },
  modalCloseButton: {
    backgroundColor: DARK_GREEN,
    paddingVertical: 12,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  // Edit Target Modal
  editTargetModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  editModalTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: DARK_GREEN,
  },
  editModalSubtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    marginVertical: Spacing.md,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 36,
    fontWeight: "800",
    color: DARK_GREEN,
    minWidth: 70,
    textAlign: "center",
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray[700],
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.lg,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  presetPillActive: {
    backgroundColor: DARK_GREEN,
  },
  presetPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gray[700],
  },
  presetPillTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  modalCancelText: {
    ...Typography.bodySmall,
    color: Colors.gray[600],
    fontWeight: "600",
  },
  modalSaveBtn: {
    backgroundColor: DARK_GREEN,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
  },
  modalSaveText: {
    color: Colors.white,
    fontWeight: "700",
  },

  // Log Book Modal
  logBookModalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  libraryBookRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  libraryBookRowDone: {
    opacity: 0.5,
  },
  libraryBookTitle: {
    ...Typography.bodySmall,
    fontWeight: "600",
    color: Colors.black,
  },
  libraryBookAuthor: {
    fontSize: 11,
    color: Colors.gray[500],
  },
  markCompleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK_GREEN,
  },
  loggedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loggedPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  manualInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  submitManualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: DARK_GREEN,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitManualText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
