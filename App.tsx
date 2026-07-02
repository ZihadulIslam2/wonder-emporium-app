import { AppProvider } from "@/providers";
import { Navigation } from "@/navigation";

export default function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
