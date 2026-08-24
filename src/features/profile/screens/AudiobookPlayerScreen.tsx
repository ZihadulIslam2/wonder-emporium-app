import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { WebView } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "@/api";
import { useReaderStore } from "@/store";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/MainNavigator";

type Props = NativeStackScreenProps<ProfileStackParamList, "AudiobookPlayer">;

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 2.0];
const SLEEP_TIMER_OPTIONS = [
  { label: "Off", minutes: 0 },
  { label: "15 Minutes", minutes: 15 },
  { label: "30 Minutes", minutes: 30 },
  { label: "45 Minutes", minutes: 45 },
  { label: "60 Minutes", minutes: 60 },
  { label: "End of Chapter", minutes: -1 },
];

const DEFAULT_CHAPTERS = [
  { id: 1, title: "Chapter 1: The Gathering Shadows", startSec: 0 },
  { id: 2, title: "Chapter 2: The Ancient Codex", startSec: 420 },
  { id: 3, title: "Chapter 3: Echoes in the Mist", startSec: 960 },
  { id: 4, title: "Chapter 4: The Clockwork Heart", startSec: 1540 },
  { id: 5, title: "Chapter 5: Whispers of the Past", startSec: 2100 },
];

// High quality fallback audiobook stream if remote file isn't uploaded yet
const FALLBACK_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function AudiobookPlayerScreen({ route, navigation }: Props) {
  const { bookId, orderItemId, title, author, coverUrl } = route.params;

  const setStoreProgress = useReaderStore((state) => state.setProgress);
  const savedData = useReaderStore((state) => state.getProgressData(bookId));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(savedData?.lastPosition || 0);
  const [duration, setDuration] = useState(savedData?.totalDuration || 1800);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(
    null,
  );
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const webViewRef = useRef<WebView>(null);
  const sleepTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(
    null,
  );

  // Fetch access URL if orderItemId is present
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

  const audioStreamUrl = useMemo(() => {
    return accessRes?.url || FALLBACK_AUDIO_URL;
  }, [accessRes]);

  // Sync active chapter based on currentTime
  useEffect(() => {
    let currentIdx = 0;
    for (let i = DEFAULT_CHAPTERS.length - 1; i >= 0; i--) {
      if (currentTime >= DEFAULT_CHAPTERS[i].startSec) {
        currentIdx = i;
        break;
      }
    }
    setActiveChapterIndex(currentIdx);
  }, [currentTime]);

  // Sleep timer ticker
  useEffect(() => {
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0) {
      sleepTimerRef.current = globalThis.setTimeout(() => {
        setSleepTimerRemaining((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (sleepTimerRemaining === 0) {
      pauseAudio();
      setSleepTimerRemaining(null);
    }
    return () => {
      if (sleepTimerRef.current) globalThis.clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimerRemaining]);

  // Save progress periodically
  const updateProgress = useCallback(
    (current: number, total: number) => {
      if (total > 0) {
        const percentage = (current / total) * 100;
        setStoreProgress(bookId, percentage, {
          orderItemId,
          lastPosition: current,
          totalDuration: total,
        });
      }
    },
    [bookId, orderItemId, setStoreProgress],
  );

  // Communication with WebView HTML5 Audio
  const sendToPlayer = (action: object) => {
    if (webViewRef.current) {
      const msg = JSON.stringify(action);
      webViewRef.current.injectJavaScript(`
        if (window.handleNativeMessage) {
          window.handleNativeMessage(${msg});
        }
        true;
      `);
    }
  };

  const playAudio = () => {
    sendToPlayer({ type: "PLAY" });
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    sendToPlayer({ type: "PAUSE" });
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const seekTo = (sec: number) => {
    const clamped = Math.max(0, Math.min(sec, duration));
    setCurrentTime(clamped);
    sendToPlayer({ type: "SEEK", time: clamped });
    updateProgress(clamped, duration);
  };

  const skipRelative = (deltaSec: number) => {
    seekTo(currentTime + deltaSec);
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIndex];
    setPlaybackRate(newRate);
    sendToPlayer({ type: "SET_RATE", rate: newRate });
  };

  const selectChapter = (index: number) => {
    const chap = DEFAULT_CHAPTERS[index];
    if (chap) {
      seekTo(chap.startSec);
      setShowChaptersModal(false);
      playAudio();
    }
  };

  const handleSleepTimerSelect = (minutes: number) => {
    if (minutes === 0) {
      setSleepTimerRemaining(null);
    } else if (minutes === -1) {
      // End of chapter
      const nextChap = DEFAULT_CHAPTERS[activeChapterIndex + 1];
      const targetSec = nextChap ? nextChap.startSec : duration;
      const remSec = Math.max(10, Math.round(targetSec - currentTime));
      setSleepTimerRemaining(remSec);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
    setShowSleepModal(false);
  };

  // Handle messages from the WebView audio player
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "TIME_UPDATE") {
        setCurrentTime(data.currentTime);
        if (data.duration && data.duration > 0) {
          setDuration(data.duration);
        }
        updateProgress(data.currentTime, data.duration || duration);
      } else if (data.type === "STATUS") {
        setIsPlaying(data.isPlaying);
      } else if (data.type === "LOADED") {
        setIsAudioLoaded(true);
        if (data.duration) {
          setDuration(data.duration);
        }
        // Resume from saved position if any
        if (savedData?.lastPosition && savedData.lastPosition > 0) {
          seekTo(savedData.lastPosition);
        }
      } else if (data.type === "ENDED") {
        setIsPlaying(false);
        updateProgress(duration, duration);
      }
    } catch {
      // ignore
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // HTML with robust HTML5 Audio Controller
  const playerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <audio id="audio" preload="auto" playsinline src="${audioStreamUrl}"></audio>
        <script>
          const audio = document.getElementById('audio');

          audio.addEventListener('loadedmetadata', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOADED',
              duration: audio.duration
            }));
          });

          audio.addEventListener('timeupdate', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'TIME_UPDATE',
              currentTime: audio.currentTime,
              duration: audio.duration
            }));
          });

          audio.addEventListener('play', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'STATUS',
              isPlaying: true
            }));
          });

          audio.addEventListener('pause', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'STATUS',
              isPlaying: false
            }));
          });

          audio.addEventListener('ended', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ENDED'
            }));
          });

          window.handleNativeMessage = function(msg) {
            if (msg.type === 'PLAY') {
              audio.play().catch(e => console.log(e));
            } else if (msg.type === 'PAUSE') {
              audio.pause();
            } else if (msg.type === 'SEEK') {
              audio.currentTime = msg.time;
            } else if (msg.type === 'SET_RATE') {
              audio.playbackRate = msg.rate;
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      {/* Hidden WebView for Audio Engine */}
      <View style={styles.hiddenWebView}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: playerHtml }}
          onMessage={handleWebViewMessage}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
        />
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-down" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarSub}>AUDIOBOOK PLAYER</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => setShowChaptersModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Art */}
        <View style={styles.coverContainer}>
          <View style={styles.coverWrapper}>
            <ExpoImage
              source={{
                uri:
                  coverUrl ||
                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600",
              }}
              style={styles.coverImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.metaContainer}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.bookAuthor}>{author}</Text>
          <TouchableOpacity
            style={styles.chapterBadge}
            onPress={() => setShowChaptersModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="bookmark" size={14} color="#C6A34F" />
            <Text style={styles.chapterBadgeText}>
              {DEFAULT_CHAPTERS[activeChapterIndex]?.title || "Chapter 1"}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#C6A34F" />
          </TouchableOpacity>
        </View>

        {/* Progress Scrubber */}
        <View style={styles.scrubberContainer}>
          <TouchableOpacity
            style={styles.progressTrack}
            activeOpacity={1}
            onPress={(e) => {
              const { locationX } = e.nativeEvent;
              // Approximate width calculation
              const trackWidth = 320;
              const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
              seekTo(ratio * duration);
            }}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercent, 100)}%` },
              ]}
            />
            <View
              style={[
                styles.progressKnob,
                { left: `${Math.min(progressPercent, 98)}%` },
              ]}
            />
          </TouchableOpacity>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>
              -{formatTime(Math.max(0, duration - currentTime))}
            </Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.controlsRow}>
          {/* Skip -15s */}
          <TouchableOpacity
            style={styles.secondaryControlBtn}
            onPress={() => skipRelative(-15)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={26} color="#134E4A" />
            <Text style={styles.skipLabel}>-15s</Text>
          </TouchableOpacity>

          {/* Previous Chapter */}
          <TouchableOpacity
            style={styles.skipChapterBtn}
            onPress={() => {
              if (activeChapterIndex > 0) {
                selectChapter(activeChapterIndex - 1);
              } else {
                seekTo(0);
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-back" size={24} color="#2C3531" />
          </TouchableOpacity>

          {/* Play / Pause Primary Button */}
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={togglePlayPause}
            activeOpacity={0.85}
          >
            {isAccessLoading && !isAudioLoaded ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={34}
                color="#FFFFFF"
                style={{ marginLeft: isPlaying ? 0 : 4 }}
              />
            )}
          </TouchableOpacity>

          {/* Next Chapter */}
          <TouchableOpacity
            style={styles.skipChapterBtn}
            onPress={() => {
              if (activeChapterIndex < DEFAULT_CHAPTERS.length - 1) {
                selectChapter(activeChapterIndex + 1);
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="play-skip-forward" size={24} color="#2C3531" />
          </TouchableOpacity>

          {/* Skip +30s */}
          <TouchableOpacity
            style={styles.secondaryControlBtn}
            onPress={() => skipRelative(30)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={26} color="#134E4A" />
            <Text style={styles.skipLabel}>+30s</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Utility Bar */}
        <View style={styles.utilityBar}>
          {/* Speed Switcher */}
          <TouchableOpacity
            style={styles.utilityItem}
            onPress={cyclePlaybackRate}
            activeOpacity={0.7}
          >
            <Text style={styles.speedText}>{playbackRate}x</Text>
            <Text style={styles.utilityLabel}>Speed</Text>
          </TouchableOpacity>

          {/* Sleep Timer */}
          <TouchableOpacity
            style={styles.utilityItem}
            onPress={() => setShowSleepModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="moon-outline"
              size={20}
              color={sleepTimerRemaining ? "#C6A34F" : "#52635C"}
            />
            <Text
              style={[
                styles.utilityLabel,
                sleepTimerRemaining ? styles.activeTimerLabel : null,
              ]}
            >
              {sleepTimerRemaining
                ? `${Math.ceil(sleepTimerRemaining / 60)}m`
                : "Timer"}
            </Text>
          </TouchableOpacity>

          {/* Chapters List */}
          <TouchableOpacity
            style={styles.utilityItem}
            onPress={() => setShowChaptersModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={20} color="#52635C" />
            <Text style={styles.utilityLabel}>Chapters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Chapters Modal */}
      <Modal
        visible={showChaptersModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChaptersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chapters</Text>
              <TouchableOpacity
                onPress={() => setShowChaptersModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {DEFAULT_CHAPTERS.map((chap, idx) => {
                const isActive = idx === activeChapterIndex;
                return (
                  <TouchableOpacity
                    key={chap.id}
                    style={[
                      styles.chapterItem,
                      isActive && styles.chapterItemActive,
                    ]}
                    onPress={() => selectChapter(idx)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chapterItemLeft}>
                      <Ionicons
                        name={
                          isActive ? "play-circle" : "radio-button-off-outline"
                        }
                        size={20}
                        color={isActive ? "#C6A34F" : "#9CA3AF"}
                      />
                      <Text
                        style={[
                          styles.chapterItemText,
                          isActive && styles.chapterItemTextActive,
                        ]}
                      >
                        {chap.title}
                      </Text>
                    </View>
                    <Text style={styles.chapterDurationText}>
                      {formatTime(chap.startSec)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSleepModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sleep Timer</Text>
              <TouchableOpacity
                onPress={() => setShowSleepModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              {SLEEP_TIMER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.sleepOption}
                  onPress={() => handleSleepTimerSelect(opt.minutes)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sleepOptionText}>{opt.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: "rgba(251, 249, 244, 0.82)",
  },
  hiddenWebView: {
    width: 0,
    height: 0,
    position: "absolute",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#134E4A",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  topBarSub: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#C6A34F",
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3531",
    marginTop: 2,
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#52635C",
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  coverContainer: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  coverWrapper: {
    width: 240,
    height: 310,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#EBE5D8",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  metaContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    width: "100%",
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    fontFamily: "serif",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  chapterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3EEE5",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  chapterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    maxWidth: 220,
  },
  scrubberContainer: {
    width: "100%",
    marginTop: Spacing.xl,
    paddingHorizontal: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5DEC9",
    borderRadius: 4,
    position: "relative",
    justifyContent: "center",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#134E4A",
    borderRadius: 4,
  },
  progressKnob: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#C6A34F",
    top: -4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: Spacing.xl,
    paddingHorizontal: 12,
  },
  secondaryControlBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  skipLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#134E4A",
    marginTop: -2,
  },
  skipChapterBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#134E4A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#134E4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#C6A34F",
  },
  utilityBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#EBE5D8",
  },
  utilityItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  speedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#134E4A",
  },
  utilityLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTimerLabel: {
    color: "#C6A34F",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
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
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "serif",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    marginBottom: Spacing.md,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  chapterItemActive: {
    backgroundColor: "#FDF8ED",
  },
  chapterItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  chapterItemText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  chapterItemTextActive: {
    color: "#134E4A",
    fontWeight: "700",
  },
  chapterDurationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  sleepOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sleepOptionText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
});
