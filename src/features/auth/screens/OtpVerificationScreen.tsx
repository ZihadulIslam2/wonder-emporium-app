import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { AuthLayout } from "../components/AuthLayout";
import { AuthButton } from "../components/AuthButton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { useResendCode } from "../hooks/useResendCode";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerification">;

const OTP_LENGTH = 6;

export function OtpVerificationScreen({ route, navigation }: Props) {
  const { email, mode } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendCode();

  const isVerifyEmail = mode === "verifyEmail";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (verifyEmailMutation.isSuccess) {
      Alert.alert("Success", "Email verified successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    }
  }, [verifyEmailMutation.isSuccess, navigation]);

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
  }, [verifyEmailMutation.isError, verifyEmailMutation.error]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, "");

    if (!clean) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Handle full OTP paste (e.g. 6 digits copied from email)
    if (clean.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH; i++) {
        newOtp[i] = clean[i] || "";
      }
      setOtp(newOtp);
      const targetFocus = Math.min(clean.length, OTP_LENGTH) - 1;
      inputRefs.current[targetFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < OTP_LENGTH - 1) {
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

  const handleResend = () => {
    if (countdown > 0 || resendMutation.isPending) return;

    resendMutation.mutate(
      { email, isVerifyEmail },
      {
        onSuccess: (data) => {
          setCountdown(60);
          const responseData = data as {
            message?: string;
            data?: { message?: string };
          };
          const msg =
            responseData?.data?.message ||
            responseData?.message ||
            "A new verification code has been sent to your email.";
          Alert.alert("Code Sent", msg);
        },
        onError: (err: unknown) => {
          const errorObj = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const msg =
            errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to resend code. Please try again.";
          Alert.alert("Error", msg);
        },
      },
    );
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <AuthLayout>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit verification code sent to your email.
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
            maxLength={6}
            selectTextOnFocus
          />
        ))}
      </View>

      <AuthButton
        label="Verify"
        onPress={handleVerify}
        disabled={!isComplete}
        loading={verifyEmailMutation.isPending}
      />

      <TouchableOpacity
        style={[
          styles.resend,
          (countdown > 0 || resendMutation.isPending) && styles.resendDisabled,
        ]}
        onPress={handleResend}
        disabled={countdown > 0 || resendMutation.isPending}
      >
        {resendMutation.isPending ? (
          <ActivityIndicator size="small" color={Colors.secondary} />
        ) : (
          <Text
            style={[
              styles.resendText,
              countdown > 0 && styles.resendTextDisabled,
            ]}
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : "Resend Code"}
          </Text>
        )}
      </TouchableOpacity>
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
    gap: 8,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
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
    paddingVertical: Spacing.xs,
  },
  resendDisabled: {
    opacity: 0.7,
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: Colors.gray[500],
  },
});
