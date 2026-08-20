import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spacing } from "@/styles/spacing";
import { WebView } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "@/api";
import { useReaderStore } from "@/store";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/MainNavigator";

type Props = NativeStackScreenProps<ProfileStackParamList, "PdfReader">;

const CHAPTERS = [
  {
    page: 1,
    title: "Chapter 1: The First Step",
    content: `In a quiet village nestled between mist-laden hills, a young woman named Elara discovers an ancient lantern that holds the power to reveal hidden truths. As she embarks on a journey to uncover its origins, she finds herself entangled in a web of secrets, lost love, and the timeless battle between light and shadow.

The wind rustled through the ancient oak trees as twilight descended upon the valley. In the distance, the faint sound of bells echoed from the clock tower, signaling the end of another long day.

Elara adjusted her coat against the sudden chill. She had walked this path a thousand times, yet today everything felt distinctly different. The stones beneath her feet seemed charged with an ancient energy, humming softly with memories of times long forgotten.

"Every journey begins with a choice," her grandfather used to whisper by the hearth fire. "Not by taking the easy road, but by stepping boldly into the unknown."`,
  },
  {
    page: 25,
    title: "Chapter 2: The Whispering Woods",
    content: `The canopy above thickened until only slivers of moonlight managed to pierce through the emerald foliage. The whispering woods were named not for the wind, but for the strange echoes that travelers often claimed to hear among the moss-covered stones.

Elara paused, holding the lantern steady. The amber glow cast long, dancing shadows across the damp earth. A soft rustling behind the ferns caught her attention, but when she turned, only the stillness of the midnight forest greeted her.

She pulled the parchment map from her leather satchel. The ink was faded, drawn by cartographers who had walked these trails centuries ago. According to the markings, the ruins of the Old Sanctum lay just beyond the ridge.`,
  },
  {
    page: 55,
    title: "Chapter 3: Secrets of the Sanctum",
    content: `The great arched doorway of the Old Sanctum stood half-swallowed by ivy and time. Massive stone pillars, carved with intricate celestial motifs, held aloft what remained of the domed ceiling.

At the center of the hall rested an altar of dark polished obsidian. As Elara approached, the flame inside her lantern flared with brilliant golden radiance. The runes upon the altar began to shimmer in response.

She reached out with a trembling hand, tracing the celestial glyphs. Knowledge rushed through her thoughts like a cascading river—tales of forgotten empires, celestial guardians, and a promise made under ancient stars.`,
  },
  {
    page: 85,
    title: "Chapter 4: Trials of the Mind",
    content: `The labyrinth beneath the sanctum was designed not to trap the body, but to challenge the mind. Hallways shifted when unobserved, and reflections in the mirrored walls showed not the present, but paths that could have been taken.

To move forward, Elara had to trust her inner compass rather than her eyes. With each riddle solved and each illusion dispelled, her confidence grew. The darkness had no hold over those who carried their own light.`,
  },
  {
    page: 115,
    title: "Chapter 5: The Dawn of Truth",
    content: `Emerging into the morning light atop the mountain summit, Elara watched as the first rays of the sun bathed the entire valley in gold. The lantern was no longer just a relic of the past; it was a beacon for the future.

With her quest fulfilled and the true history restored, she knew that the world was about to change. And for the first time in her life, she felt entirely ready for whatever lay ahead.`,
  },
];

const TOTAL_PAGES = 140;

export function PdfReaderScreen({ route, navigation }: Props) {
  const { bookId, orderItemId, title, author } = route.params;

  const setStoreProgress = useReaderStore((state) => state.setProgress);
  const theme = useReaderStore((state) => state.theme);
  const setTheme = useReaderStore((state) => state.setTheme);
  const fontSize = useReaderStore((state) => state.fontSize);
  const setFontSize = useReaderStore((state) => state.setFontSize);
  const savedData = useReaderStore((state) => state.getProgressData(bookId));

  const [currentPage, setCurrentPage] = useState(
    savedData?.lastPosition ||
      Math.max(1, Math.round(((savedData?.progress || 0) / 100) * TOTAL_PAGES)),
  );
  const totalPages = savedData?.totalPages || TOTAL_PAGES;
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPageInput, setJumpPageInput] = useState(String(currentPage));

  const webViewRef = useRef<WebView>(null);

  // Fetch access URL for PDF if purchased
  const { data: accessRes, isLoading: isAccessLoading } = useQuery({
    queryKey: ["library-access", orderItemId],
    queryFn: async () => {
      if (!orderItemId) return null;
      try {
        const res = await libraryApi.getAccess(orderItemId);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(orderItemId),
  });

  const pdfUrl = accessRes?.url;

  // Save progress when page changes
  const saveProgress = useCallback(
    (page: number, total: number) => {
      const percentage = (page / total) * 100;
      setStoreProgress(bookId, percentage, {
        orderItemId,
        lastPosition: page,
        totalPages: total,
      });
    },
    [bookId, orderItemId, setStoreProgress],
  );

  useEffect(() => {
    saveProgress(currentPage, totalPages);
    setJumpPageInput(String(currentPage));
  }, [currentPage, totalPages, saveProgress]);

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.goToPage) {
          window.goToPage(${clamped});
        }
        true;
      `);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleJumpSubmit = () => {
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum)) {
      goToPage(pageNum);
    }
  };

  // Find active chapter based on current page
  const currentChapter = useMemo(() => {
    for (let i = CHAPTERS.length - 1; i >= 0; i--) {
      if (currentPage >= CHAPTERS[i].page) {
        return CHAPTERS[i];
      }
    }
    return CHAPTERS[0];
  }, [currentPage]);

  // Theme color styles
  const themeStyles = useMemo(() => {
    switch (theme) {
      case "dark":
        return {
          bg: "#121212",
          cardBg: "#1E1E1E",
          text: "#E0E0E0",
          subText: "#A0A0A0",
          border: "#333333",
          active: "#C6A34F",
        };
      case "sepia":
        return {
          bg: "#FBF0D9",
          cardBg: "#F4E4C1",
          text: "#5F4B32",
          subText: "#8C7355",
          border: "#E2CFAD",
          active: "#8A5A2B",
        };
      case "light":
      default:
        return {
          bg: "#FFFFFF",
          cardBg: "#F8F6F0",
          text: "#2C3531",
          subText: "#6B7280",
          border: "#EBE5D8",
          active: "#134E4A",
        };
    }
  }, [theme]);

  // Reader HTML content with responsive layout & smooth page styling
  const readerHtml = useMemo(() => {
    const isDark = theme === "dark";
    const isSepia = theme === "sepia";
    const bgCol = isDark ? "#121212" : isSepia ? "#FBF0D9" : "#FFFFFF";
    const textCol = isDark ? "#E0E0E0" : isSepia ? "#5F4B32" : "#2C3531";

    if (pdfUrl) {
      // Use PDF Viewer with fallback
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
            <style>
              body, html { margin: 0; padding: 0; height: 100%; width: 100%; background-color: ${bgCol}; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(pdfUrl)}"></iframe>
          </body>
        </html>
      `;
    }

    // High quality rich eBook textbook renderer
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px 20px 80px 20px;
              background-color: ${bgCol};
              color: ${textCol};
              font-family: 'Lora', Georgia, serif;
              font-size: ${fontSize}px;
              line-height: 1.75;
              letter-spacing: 0.2px;
              transition: background-color 0.25s ease, color 0.25s ease;
            }
            .chapter-header {
              text-align: center;
              margin-bottom: 28px;
              padding-bottom: 16px;
              border-bottom: 1px solid ${isDark ? "#333" : isSepia ? "#E2CFAD" : "#EBE5D8"};
            }
            .book-title-sub {
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              opacity: 0.6;
              margin-bottom: 6px;
            }
            .chapter-title {
              font-size: ${fontSize + 6}px;
              font-weight: 600;
              margin: 0;
            }
            p {
              margin-bottom: 1.4em;
              text-indent: 1.2em;
            }
            p:first-of-type {
              text-indent: 0;
            }
            p:first-of-type::first-letter {
              font-size: 2.8em;
              float: left;
              line-height: 0.85;
              padding-right: 8px;
              font-weight: bold;
              color: ${isDark ? "#C6A34F" : isSepia ? "#8A5A2B" : "#134E4A"};
            }
          </style>
        </head>
        <body>
          <div class="chapter-header">
            <div class="book-title-sub">${title}</div>
            <h1 class="chapter-title">${currentChapter.title}</h1>
          </div>
          ${currentChapter.content
            .split("\n\n")
            .map((p) => `<p>${p.trim()}</p>`)
            .join("")}
          <script>
            window.goToPage = function(p) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            };
          </script>
        </body>
      </html>
    `;
  }, [theme, fontSize, title, currentChapter, pdfUrl]);

  const progressPercent = Math.round((currentPage / totalPages) * 100);

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.bg }]}>
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: themeStyles.cardBg,
            borderBottomColor: themeStyles.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: themeStyles.border }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={themeStyles.text} />
        </TouchableOpacity>

        <View style={styles.topBarInfo}>
          <Text
            style={[styles.topBarTitle, { color: themeStyles.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={[styles.topBarAuthor, { color: themeStyles.subText }]}>
            {author}
          </Text>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: themeStyles.border }]}
            onPress={() => setShowSearchBar(!showSearchBar)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color={themeStyles.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: themeStyles.border }]}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="text-outline" size={18} color={themeStyles.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: themeStyles.border }]}
            onPress={() => setShowTOC(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={18} color={themeStyles.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar Dropdown */}
      {showSearchBar && (
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: themeStyles.cardBg,
              borderBottomColor: themeStyles.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={themeStyles.subText} />
          <TextInput
            style={[styles.searchInput, { color: themeStyles.text }]}
            placeholder="Search within book..."
            placeholderTextColor={themeStyles.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={themeStyles.subText}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* PDF / eBook Reader WebView */}
      <View style={styles.webViewContainer}>
        {isAccessLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeStyles.active} />
            <Text style={[styles.loadingText, { color: themeStyles.subText }]}>
              Loading document...
            </Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: readerHtml }}
            style={{ backgroundColor: themeStyles.bg }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}
      </View>

      {/* Bottom Floating Scrubber & Page Navigator */}
      <View
        style={[
          styles.bottomControls,
          {
            backgroundColor: themeStyles.cardBg,
            borderTopColor: themeStyles.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.pageNavBtn,
            currentPage <= 1 && styles.pageNavBtnDisabled,
          ]}
          onPress={handlePrevPage}
          disabled={currentPage <= 1}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={currentPage <= 1 ? themeStyles.subText : themeStyles.active}
          />
          <Text
            style={[
              styles.pageNavText,
              {
                color:
                  currentPage <= 1 ? themeStyles.subText : themeStyles.active,
              },
            ]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        {/* Page Scrubber & Quick Jump */}
        <View style={styles.pageIndicatorContainer}>
          <View style={styles.pageInputRow}>
            <Text
              style={[styles.pageIndicatorLabel, { color: themeStyles.text }]}
            >
              Page {currentPage} of {totalPages}
            </Text>
            <Text style={[styles.progressBadge, { color: themeStyles.active }]}>
              {progressPercent}%
            </Text>
          </View>

          {/* Interactive Progress Track */}
          <TouchableOpacity
            style={[
              styles.progressBarTrack,
              { backgroundColor: themeStyles.border },
            ]}
            activeOpacity={1}
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              const ratio = Math.max(0, Math.min(1, locationX / 160));
              const targetPage = Math.max(1, Math.round(ratio * totalPages));
              goToPage(targetPage);
            }}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: themeStyles.active,
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.pageNavBtn,
            currentPage >= totalPages && styles.pageNavBtnDisabled,
          ]}
          onPress={handleNextPage}
          disabled={currentPage >= totalPages}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pageNavText,
              {
                color:
                  currentPage >= totalPages
                    ? themeStyles.subText
                    : themeStyles.active,
              },
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              currentPage >= totalPages
                ? themeStyles.subText
                : themeStyles.active
            }
          />
        </TouchableOpacity>
      </View>

      {/* Table of Contents Modal */}
      <Modal
        visible={showTOC}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTOC(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: themeStyles.cardBg }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: themeStyles.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeStyles.text }]}>
                Table of Contents
              </Text>
              <TouchableOpacity
                onPress={() => setShowTOC(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {CHAPTERS.map((chap) => {
                const isActive = currentChapter.title === chap.title;
                return (
                  <TouchableOpacity
                    key={chap.title}
                    style={[
                      styles.tocItem,
                      isActive && { backgroundColor: themeStyles.border },
                    ]}
                    onPress={() => {
                      goToPage(chap.page);
                      setShowTOC(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tocItemTitle,
                        {
                          color: isActive
                            ? themeStyles.active
                            : themeStyles.text,
                          fontWeight: isActive ? "700" : "500",
                        },
                      ]}
                    >
                      {chap.title}
                    </Text>
                    <Text
                      style={[
                        styles.tocItemPage,
                        { color: themeStyles.subText },
                      ]}
                    >
                      p. {chap.page}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Jump to specific page input */}
            <View
              style={[styles.jumpRow, { borderTopColor: themeStyles.border }]}
            >
              <Text style={[styles.jumpLabel, { color: themeStyles.text }]}>
                Jump to Page:
              </Text>
              <TextInput
                style={[
                  styles.jumpInput,
                  {
                    color: themeStyles.text,
                    borderColor: themeStyles.border,
                    backgroundColor: themeStyles.bg,
                  },
                ]}
                value={jumpPageInput}
                onChangeText={setJumpPageInput}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity
                style={[
                  styles.jumpBtn,
                  { backgroundColor: themeStyles.active },
                ]}
                onPress={() => {
                  handleJumpSubmit();
                  setShowTOC(false);
                }}
              >
                <Text style={styles.jumpBtnText}>GO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reader Settings Modal (Theme, Font size) */}
      <Modal
        visible={showSettings}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: themeStyles.cardBg }]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: themeStyles.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeStyles.text }]}>
                Reader Display
              </Text>
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={themeStyles.subText} />
              </TouchableOpacity>
            </View>

            {/* Font Size controls */}
            <View style={styles.settingSection}>
              <Text style={[styles.settingLabel, { color: themeStyles.text }]}>
                Text Size ({fontSize}px)
              </Text>
              <View style={styles.fontSizeRow}>
                <TouchableOpacity
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: themeStyles.bg,
                      borderColor: themeStyles.border,
                    },
                  ]}
                  onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  <Text
                    style={[styles.sizeBtnText, { color: themeStyles.text }]}
                  >
                    A-
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[styles.fontSizePreview, { color: themeStyles.text }]}
                >
                  Aa
                </Text>
                <TouchableOpacity
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: themeStyles.bg,
                      borderColor: themeStyles.border,
                    },
                  ]}
                  onPress={() => setFontSize(Math.min(28, fontSize + 2))}
                >
                  <Text
                    style={[styles.sizeBtnText, { color: themeStyles.text }]}
                  >
                    A+
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Themes */}
            <View style={styles.settingSection}>
              <Text style={[styles.settingLabel, { color: themeStyles.text }]}>
                Reading Theme
              </Text>
              <View style={styles.themesRow}>
                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: "#FFFFFF", borderColor: "#E5DEC9" },
                    theme === "light" && styles.themeOptionActive,
                  ]}
                  onPress={() => setTheme("light")}
                >
                  <Text style={{ color: "#2C3531", fontWeight: "600" }}>
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: "#FBF0D9", borderColor: "#E2CFAD" },
                    theme === "sepia" && styles.themeOptionActive,
                  ]}
                  onPress={() => setTheme("sepia")}
                >
                  <Text style={{ color: "#5F4B32", fontWeight: "600" }}>
                    Sepia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeOption,
                    { backgroundColor: "#121212", borderColor: "#333333" },
                    theme === "dark" && styles.themeOptionActive,
                  ]}
                  onPress={() => setTheme("dark")}
                >
                  <Text style={{ color: "#E0E0E0", fontWeight: "600" }}>
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "serif",
  },
  topBarAuthor: {
    fontSize: 12,
    marginTop: 1,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  webViewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  pageNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  pageNavBtnDisabled: {
    opacity: 0.4,
  },
  pageNavText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pageIndicatorContainer: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 12,
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  pageIndicatorLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressBadge: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarTrack: {
    width: 160,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "serif",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    marginBottom: Spacing.md,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  tocItemTitle: {
    fontSize: 14,
    flex: 1,
  },
  tocItemPage: {
    fontSize: 12,
  },
  jumpRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: 8,
  },
  jumpLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  jumpInput: {
    width: 60,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  jumpBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  jumpBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  settingSection: {
    marginBottom: Spacing.lg,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  fontSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sizeBtn: {
    width: 64,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  fontSizePreview: {
    fontSize: 22,
    fontWeight: "700",
  },
  themesRow: {
    flexDirection: "row",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
  },
  themeOptionActive: {
    borderColor: "#C6A34F",
  },
});
