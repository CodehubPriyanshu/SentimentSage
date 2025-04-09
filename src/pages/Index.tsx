
import Home from "./Home";
import { ThemeProvider } from "@/hooks/useTheme";

const Index = () => {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
};

export default Index;
