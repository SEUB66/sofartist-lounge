import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import UnicornBackground from "@/components/UnicornBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <UnicornBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-[400px] bg-black/30 backdrop-blur-xl border-white/10 text-white shadow-2xl relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x">
            DEVCAVE BAR
          </CardTitle>
          <CardDescription className="text-center text-gray-300 text-lg font-light">
            Exclusive Access Only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="username" className="text-gray-200 font-medium">Identity</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your codename" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500/50 focus:ring-pink-500/20 h-12 transition-all duration-300" 
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">Passphrase</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-12 transition-all duration-300" 
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button className="w-full h-12 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white border-0 font-bold tracking-wide shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
            AUTHENTICATE
          </Button>
          <Button variant="link" className="text-gray-400 hover:text-white text-sm font-light">
            Forgot your credentials?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
