import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import UnicornBackground from "@/components/UnicornBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();

  // Define glass styles based on theme
  const getGlassStyle = () => {
    switch (theme) {
      case 'dark':
        return "bg-cyan-900/20 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]";
      case 'light':
        return "bg-orange-500/20 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.2)]";
      case 'unicorn':
        return "bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.3)]";
      default:
        return "bg-black/40 border-white/10";
    }
  };

  const getTitleStyle = () => {
    switch (theme) {
      case 'dark':
        return "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]";
      case 'light':
        return "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]";
      case 'unicorn':
        return "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]";
      default:
        return "text-white";
    }
  };

  const getButtonStyle = () => {
    switch (theme) {
      case 'dark':
        return "bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]";
      case 'light':
        return "bg-orange-500/80 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]";
      case 'unicorn':
        return "bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]";
      default:
        return "bg-white/10 hover:bg-white/20";
    }
  };

  const getInputStyle = () => {
    switch (theme) {
      case 'dark':
        return "border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-cyan-300/30 text-cyan-100";
      case 'light':
        return "border-orange-500/30 focus:border-orange-400 focus:ring-orange-400/20 placeholder:text-orange-300/50 text-orange-900 font-medium";
      case 'unicorn':
        return "border-pink-500/30 focus:border-pink-400 focus:ring-pink-400/20 placeholder:text-pink-300/50 text-white";
      default:
        return "border-white/20";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <UnicornBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className={`w-[400px] backdrop-blur-xl border transition-all duration-500 ${getGlassStyle()}`}>
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className={`text-4xl font-black text-center tracking-tighter uppercase transition-all duration-500 ${getTitleStyle()}`}>
            DEVCAVE BAR
          </CardTitle>
          <CardDescription className={`text-center text-lg font-light tracking-widest uppercase ${theme === 'light' ? 'text-orange-800/70' : 'text-gray-300'}`}>
            Access Terminal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="username" className={`font-bold uppercase tracking-widest text-xs ${theme === 'light' ? 'text-orange-700' : 'text-gray-300'}`}>
                  Identity
                </Label>
                <Input 
                  id="username" 
                  placeholder="CODENAME" 
                  className={`bg-white/5 h-12 transition-all duration-300 ${getInputStyle()}`} 
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password" className={`font-bold uppercase tracking-widest text-xs ${theme === 'light' ? 'text-orange-700' : 'text-gray-300'}`}>
                  Passphrase
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••••••" 
                  className={`bg-white/5 h-12 transition-all duration-300 ${getInputStyle()}`} 
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button className={`w-full h-12 border-0 font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] ${getButtonStyle()}`}>
            Enter System
          </Button>
          <Button variant="link" className={`text-sm font-light ${theme === 'light' ? 'text-orange-800 hover:text-orange-600' : 'text-gray-400 hover:text-white'}`}>
            Forgot credentials?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
