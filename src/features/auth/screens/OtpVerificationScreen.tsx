import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { AuthLayout } from "../components/AuthLayout";
import { AuthButton } from "../components/AuthButton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useVerifyEmail } from "../hooks/useVerifyEmail";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerification">;

const OTP_LENGTH = 4;

export function OtpVerificationScreen({ route, navigation }: Props) {
  const { email, mode } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const verifyEmailMutation = useVerifyEmail();

  const isVerifyEmail = mode === "verifyEmail";

  useEffect(() => {
    if (verifyEmailMutation.isSuccess) {
      Alert.alert("Success", "Email verified successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    }
  }, [verifyEmailMutation.isSuccess]);

  useEffect(() => {
    if (verifyEmailMutation.isError) {
      const message =
        (
          verifyEmailMutation.error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message || "Verification failed. Please try again.";
      Alert.alert("Error", message);
    }
  }, [verifyEmailMutation.isError]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;

    if (isVerifyEmail) {
      verifyEmailMutation.mutate({ email, code });
    } else {
      navigation.navigate("CreateNewPassword", { email, code });
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <AuthLayout>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>
        Enter the verification code sent to your email.
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpBox,
              digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <AuthButton
        label="Verify"
        onPress={handleVerify}
        disabled={!isComplete}
        loading={verifyEmailMutation.isPending}
      />

      {isVerifyEmail && (
        <TouchableOpacity style={styles.resend} onPress={() => {}}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  otpBoxFilled: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.white,
  },
  otpBoxEmpty: {
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  resend: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
  },
});
