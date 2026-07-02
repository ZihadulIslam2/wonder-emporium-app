import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const Typography = {
  h1: { fontSize: 32, fontWeight: "700" as const, fontFamily },
  h2: { fontSize: 24, fontWeight: "600" as const, fontFamily },
  h3: { fontSize: 20, fontWeight: "600" as const, fontFamily },
  body: { fontSize: 16, fontWeight: "400" as const, fontFamily },
  bodySmall: { fontSize: 14, fontWeight: "400" as const, fontFamily },
  caption: { fontSize: 12, fontWeight: "400" as const, fontFamily },
  button: { fontSize: 16, fontWeight: "600" as const, fontFamily },
};
