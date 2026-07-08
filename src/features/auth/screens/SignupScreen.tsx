// src/features/auth/screens/SignupScreen.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { registerSchema, RegisterFormData } from "../validation";
import { AuthLayout } from "../components/AuthLayout";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useNavigation } from "@react-navigation/native";
import { useRegister } from "../hooks/useRegister";
import axios from "axios";

type SignupNav = NativeStackNavigationProp<AuthStackParamList, "Signup">;

export function SignupScreen() {
  const navigation = useNavigation<SignupNav>();
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Submitting registration data:", {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: "READER",
    });

    registerMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "READER",
      },
      {
        onSuccess: (response) => {
          console.log("Registration success response:", response);

          // The response might be nested differently depending on your API
          // Check if response.data exists
          let email = data.email;

          // If your API returns the email in the response, you can use that too
          if (response?.data?.email) {
            email = response.data.email;
          }

          navigation.navigate("OtpVerification", {
            email: email,
            mode: "verifyEmail",
          });
        },
        onError: (error: unknown) => {
          let message = "Registration failed. Please try again.";

          if (axios.isAxiosError(error)) {
            message = error.response?.data?.message ?? error.message ?? message;
          } else if (error instanceof Error) {
            message = error.message;
          }

          Alert.alert("Error", message);
        },
      },
    );
  };

  // Remove the useEffect that was showing errors, we'll handle it in the mutation's onError

  return (
    <AuthLayout>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>
        Sign up to explore books, audiobooks, and personalized content.
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value, onBlur } }) => (
            <AuthInput
              placeholder="First Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.firstName?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value, onBlur } }) => (
            <AuthInput
              placeholder="Last Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.lastName?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <AuthInput
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <AuthInput
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value, onBlur } }) => (
            <AuthInput
              placeholder="Confirm password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />

        <AuthButton
          label="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={registerMutation.isPending}
          disabled={registerMutation.isPending}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerLink}>Log in now</Text>
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
  form: {
    width: "100%",
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
