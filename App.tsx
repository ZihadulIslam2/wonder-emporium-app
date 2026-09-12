import "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider } from "@/providers";
import { Navigation } from "@/navigation";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
