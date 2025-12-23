import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme, Theme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-2 border-purple-400/60 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 hover:scale-110 transition-all duration-300 w-14 h-14">
          {theme === 'light' && <Sun className="h-[1.8rem] w-[1.8rem] rotate-0 scale-100 transition-all text-yellow-500" />}
          {theme === 'dark' && <Moon className="h-[1.8rem] w-[1.8rem] rotate-0 scale-100 transition-all text-blue-400" />}
          {theme === 'unicorn' && <Sparkles className="h-[1.8rem] w-[1.8rem] rotate-0 scale-100 transition-all text-fuchsia-400 animate-pulse" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-xl bg-background/80 border-white/10">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("unicorn")}>
          <Sparkles className="mr-2 h-4 w-4 text-fuchsia-400" />
          Unicorn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
