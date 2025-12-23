import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import Home from "./pages/Home";
import Hub from "./pages/Hub";
import RetroTV from "./components/RetroTV";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/hub"} component={Hub} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeProvider
          defaultTheme="dark"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            {/* RetroTV persistante sur toutes les pages */}
            <RetroTV isOpen={true} onClose={() => {}} autoPlayTrigger={false} />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
