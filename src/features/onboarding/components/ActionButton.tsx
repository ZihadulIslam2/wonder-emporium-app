import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/styles/colors";
import { Spacing } from "@/styles/spacing";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: "filled" | "text";
}

export function ActionButton({
  label,
  onPress,
  variant = "filled",
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === "filled" ? styles.filled : styles.textButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.label,
          variant === "filled" ? styles.filledLabel : styles.textLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  filled: {
    backgroundColor: "#EAB308",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 12,
    width: "100%",
  },
  textButton: {
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  filledLabel: {
    color: Colors.white,
  },
  textLabel: {
    color: Colors.gray[400],
  },
});
