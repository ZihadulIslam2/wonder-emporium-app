import { View, StyleSheet } from "react-native";

interface PaginationDotsProps {
  total: number;
  currentIndex: number;
}

export function PaginationDots({ total, currentIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#60A5FA",
    width: 24,
    borderRadius: 4,
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
});
