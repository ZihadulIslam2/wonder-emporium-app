import { useState, type ReactNode } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";
import { Typography } from "@/styles/typography";
import { Spacing } from "@/styles/spacing";

interface AuthInputProps extends TextInputProps {
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
}

export function AuthInput({
  error,
  icon,
  rightIcon,
  isPassword = false,
  style,
  value,
  secureTextEntry,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.gray[400]}
          value={value ?? ""}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.eyeButton}
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.gray[500]}
            />
          </TouchableOpacity>
        ) : (
          rightIcon
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.black,
    padding: 0,
  },
  eyeButton: {
    paddingLeft: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
