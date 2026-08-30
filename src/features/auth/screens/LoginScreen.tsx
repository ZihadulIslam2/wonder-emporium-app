import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { loginSchema, LoginFormData } from "../validation";
import { AuthLayout } from "../components/AuthLayout";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../hooks/useLogin";
import { useEffect } from "react";

type LoginNav = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  useEffect(() => {
    if (loginMutation.isError) {
      const err = loginMutation.error as Error & {
        response?: {
          data?: { message?: string | string[]; error?: string };
          status?: number;
        };
        code?: string;
      };
      const rawMessage = err?.response?.data?.message;
      const serverMessage = Array.isArray(rawMessage)
        ? rawMessage.join("\n")
        : typeof rawMessage === "string"
          ? rawMessage
          : err?.response?.data?.error;

      let message = "Login failed. Please try again.";

      if (serverMessage) {
        message = serverMessage;
      } else if (
        err?.code === "ERR_NETWORK" ||
        err?.message?.includes("Network Error")
      ) {
        message =
          "Network Error: Unable to connect to the backend server. If using Android Studio Emulator, ensure your backend is accessible.";
      } else if (err?.message) {
        message = err.message;
      }

      if (
        message.toLowerCase().includes("not verified") ||
        message.toLowerCase().includes("unverified")
      ) {
        Alert.alert(
          "Email Not Verified",
          "Your email address is not verified yet. Would you like to verify it now?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Verify",
              onPress: () => {
                const enteredEmail = control._formValues?.email || "";
                navigation.navigate("OtpVerification", {
                  email: enteredEmail,
                  mode: "verifyEmail",
                });
              },
            },
          ],
        );
      } else {
        Alert.alert("Login Failed", message);
      }
    }
  }, [loginMutation.isError, loginMutation.error, navigation, control]);

  return (
    <AuthLayout>
      <Text style={styles.title}>Welcome to{"\n"}W.E Books</Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <AuthButton
          label="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={loginMutation.isPending}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.footerLink}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Spacing.xxl,
  },
  form: {
    width: "100%",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xxl,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.gray[500],
  },
  footerLink: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: "600",
  },
});
