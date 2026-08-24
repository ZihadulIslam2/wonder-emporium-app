import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api";
import { useNavigation } from "@react-navigation/native";
import { useLogout } from "@/features/auth";

export function AccountInfoScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = globalThis.confirm("Are you sure you want to log out?");
      if (confirmed) {
        logoutMutation.mutate(undefined);
      }
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            logoutMutation.mutate(undefined);
          },
        },
      ]);
    }
  };

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await authApi.getProfile();
      return response.data;
    },
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profileData) {
      const userData =
        profileData?.data?.data || profileData?.data || profileData;
      const p = userData?.profile || userData?.userProfile || userData || {};
      setFirstName(p.firstName || userData?.firstName || "");
      setLastName(p.lastName || userData?.lastName || "");
      setLocation(p.location || userData?.location || "");
      setBio(p.bio || userData?.bio || "");
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      location: string;
      bio: string;
    }) => {
      const res = await authApi.updateProfile(payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg("Account information updated successfully!");
      setErrorMsg("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      globalThis.setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to update account information. Please try again.";
      setErrorMsg(msg);
      setSuccessMsg("");
    },
  });

  const uploadAvatarFile = async (
    uri: string,
    mimeType?: string,
    fileName?: string,
  ) => {
    try {
      setIsUploadingAvatar(true);
      setErrorMsg("");
      const formData = new FormData();
      const name =
        fileName || uri.split("/").pop() || `avatar_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(name);
      const type = mimeType || (match ? `image/${match[1]}` : "image/jpeg");

      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append("avatar", blob, name);
      } else {
        formData.append("avatar", {
          uri,
          name,
          type,
        } as unknown as Blob);
      }

      await authApi.updateAvatar(formData);
      setSuccessMsg("Avatar updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      globalThis.setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to upload avatar. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access photo library is required to select an avatar.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadAvatarFile(
          asset.uri,
          asset.mimeType,
          asset.fileName ?? undefined,
        );
      }
    } catch {
      setErrorMsg("Failed to pick image from library.");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required to take a photo.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadAvatarFile(
          asset.uri,
          asset.mimeType,
          asset.fileName ?? undefined,
        );
      }
    } catch {
      setErrorMsg("Failed to take photo.");
    }
  };

  const handlePickAvatar = () => {
    if (Platform.OS === "web") {
      handlePickFromLibrary();
    } else {
      Alert.alert("Change Profile Picture", "Select a photo source", [
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Library", onPress: handlePickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleSave = () => {
    if (!firstName.trim()) {
      setErrorMsg("First name cannot be empty.");
      return;
    }
    setErrorMsg("");
    updateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location: location.trim(),
      bio: bio.trim(),
    });
  };

  const userData =
    profileData?.data?.data || profileData?.data || profileData || {};
  const userProfile =
    userData?.profile || userData?.userProfile || userData || {};
  const email = userData?.email || profileData?.email || "";
  const username =
    userData?.username ||
    userProfile?.username ||
    (email ? email.split("@")[0] : "user");
  const role = userData?.role || profileData?.role || "READER";
  const avatarUrl = userProfile?.avatarUrl || userData?.avatarUrl || "";

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
        <Text style={styles.topBarTitle}>Account Info</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header User Card */}
            <View style={styles.headerCard}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
                activeOpacity={0.8}
              >
                <View style={styles.avatar}>
                  {avatarUrl ? (
                    <ExpoImage
                      source={{ uri: avatarUrl }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={150}
                    />
                  ) : (
                    <Ionicons
                      name="person"
                      size={38}
                      color={Colors.secondary}
                    />
                  )}
                  {isUploadingAvatar && (
                    <View style={styles.avatarLoadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>
                  {firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : username}
                </Text>
                <Text style={styles.headerEmail}>{email}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.usernameText}>@{username}</Text>
                </View>
              </View>
            </View>

            {/* Notification Messages */}
            {!!successMsg && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={20} color="#065F46" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#991B1B" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Edit Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    placeholderTextColor={Colors.gray[400]}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    placeholderTextColor={Colors.gray[400]}
                  />
                </View>
              </View>

              {/* Email (Disabled/Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address (Read-only)</Text>
                <View style={[styles.inputWrapper, styles.disabledWrapper]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={email}
                    editable={false}
                  />
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={Colors.gray[400]}
                  />
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="City, Country"
                    placeholderTextColor={Colors.gray[400]}
                  />
                </View>
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About / Bio</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { alignItems: "flex-start", paddingTop: 10 },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={Colors.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { height: 80, textAlignVertical: "top" },
                    ]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us a bit about your reading preferences..."
                    placeholderTextColor={Colors.gray[400]}
                    multiline
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={updateMutation.isPending}
                activeOpacity={0.8}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              disabled={logoutMutation.isPending}
              activeOpacity={0.7}
            >
              {logoutMutation.isPending ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#EF4444"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.logoutText}>Log out</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#134E4A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerInfo: { flex: 1 },
  headerName: { ...Typography.h3, color: Colors.black },
  headerEmail: { ...Typography.caption, color: Colors.gray[500], marginTop: 2 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: { fontSize: 11, fontWeight: "700", color: "#0369A1" },
  usernameText: { fontSize: 12, color: Colors.gray[400] },

  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: Spacing.sm,
    borderRadius: 10,
    marginBottom: Spacing.md,
    gap: 8,
  },
  successText: { color: "#065F46", fontSize: 14, fontWeight: "600", flex: 1 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: Spacing.sm,
    borderRadius: 10,
    marginBottom: Spacing.md,
    gap: 8,
  },
  errorText: { color: "#991B1B", fontSize: 14, fontWeight: "600", flex: 1 },

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
  sectionTitle: {
    ...Typography.h3,
    color: "#134E4A",
    marginBottom: Spacing.lg,
  },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.gray[700],
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
  },
  disabledWrapper: {
    backgroundColor: "#F3F4F6",
    borderColor: Colors.gray[200],
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 44,
    ...Typography.body,
    color: Colors.black,
  },
  disabledInput: { color: Colors.gray[500] },

  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#134E4A",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  saveBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  logoutText: { ...Typography.button, color: "#EF4444", fontWeight: "700" },
});
