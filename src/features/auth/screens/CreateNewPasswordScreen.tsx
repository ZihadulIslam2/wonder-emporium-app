import { View, Text, StyleSheet } from "react-native";
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

type Props = NativeStackScreenProps<AuthStackParamList, "CreateNewPassword">;

export function CreateNewPasswordScreen({ route }: Props) {
  const { email } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log("Reset password for:", email, data);
  };

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

        <AuthButton label="Reset Password" onPress={handleSubmit(onSubmit)} />
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
