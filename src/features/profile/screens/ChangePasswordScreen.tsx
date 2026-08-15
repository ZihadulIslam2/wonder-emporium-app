import { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import bgImage from "@/assets/onboarding/onboarding bg.png";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { useNavigation } from "@react-navigation/native";

export function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: {
      oldPassword: string;
      newPassword: string;
    }) => {
      const res = await authApi.changePassword(payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg("Password changed successfully!");
      setErrorMsg("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to change password. Please verify your current password.";
      setErrorMsg(msg);
      setSuccessMsg("");
    },
  });

  const handleSubmit = () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!oldPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    changePasswordMutation.mutate({
      oldPassword,
      newPassword,
    });
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
        <Text style={styles.topBarTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={32} color="#134E4A" />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Update Security</Text>
              <Text style={styles.headerSub}>
                Create a strong password with at least 8 characters to keep your
                account safe.
              </Text>
            </View>
          </View>

          {/* Feedback Messages */}
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

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Old Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.gray[400]}
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password (min. 8 characters)"
                  placeholderTextColor={Colors.gray[400]}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.gray[400]}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={Colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password rules indicator */}
            <View style={styles.ruleBox}>
              <Ionicons
                name={
                  newPassword.length >= 8
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={newPassword.length >= 8 ? "#10B981" : Colors.gray[400]}
              />
              <Text
                style={[
                  styles.ruleText,
                  newPassword.length >= 8 && {
                    color: "#065F46",
                    fontWeight: "600",
                  },
                ]}
              >
                At least 8 characters long
              </Text>
            </View>
            <View style={[styles.ruleBox, { marginTop: 4 }]}>
              <Ionicons
                name={
                  newPassword && newPassword === confirmPassword
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  newPassword && newPassword === confirmPassword
                    ? "#10B981"
                    : Colors.gray[400]
                }
              />
              <Text
                style={[
                  styles.ruleText,
                  newPassword &&
                    newPassword === confirmPassword && {
                      color: "#065F46",
                      fontWeight: "600",
                    },
                ]}
              >
                Passwords match
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={changePasswordMutation.isPending}
              activeOpacity={0.8}
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitBtnText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerTextCol: { flex: 1 },
  headerTitle: { ...Typography.h3, color: Colors.black },
  headerSub: {
    ...Typography.caption,
    color: Colors.gray[500],
    marginTop: 4,
    lineHeight: 18,
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
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 44,
    ...Typography.body,
    color: Colors.black,
  },
  ruleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#134E4A",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  submitBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: "700",
  },
});
