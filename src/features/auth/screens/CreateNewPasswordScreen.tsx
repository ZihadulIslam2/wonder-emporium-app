import { View, Text, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";
import { resetPasswordSchema, ResetPasswordFormData } from "../validation";
import { AuthLayout } from "../components/AuthLayout";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useResetPassword } from "../hooks/useResetPassword";
import { useEffect } from "react";

type Props = NativeStackScreenProps<AuthStackParamList, "CreateNewPassword">;

export function CreateNewPasswordScreen({ route, navigation }: Props) {
  const { email, code } = route.params;
  const resetPasswordMutation = useResetPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(
      { email, code, password: data.password },
      {
        onSuccess: () => {
          Alert.alert("Success", "Password has been reset successfully.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ]);
        },
      },
    );
  };

  useEffect(() => {
    if (resetPasswordMutation.isError) {
      const message =
        (
          resetPasswordMutation.error as {
            response?: { data?: { message?: string } };
          }
        )?.response?.data?.message || "Failed to reset password.";
      Alert.alert("Error", message);
    }
  }, [resetPasswordMutation.isError]);

  return (
    <AuthLayout>
      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>
        Set a new password and regain access to your account.
      </Text>

      <View style={styles.form}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              placeholder="New Password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AuthInput
              placeholder="Confirm password"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />

        <AuthButton
          label="Reset Password"
          onPress={handleSubmit(onSubmit)}
          loading={resetPasswordMutation.isPending}
        />
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
});
