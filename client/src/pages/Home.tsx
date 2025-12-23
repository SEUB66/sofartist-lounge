import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UnicornBackground from "@/components/UnicornBackground";
import RacingStripes from "@/components/RacingStripes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background with particles */}
      <UnicornBackground />
      
      {/* Racing stripes overlay */}
      <RacingStripes />
      
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main login container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Apple Punk Banner */}
          <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
            <img 
              src="/applepunk-banner.jpg" 
              alt="Apple Punk" 
              className="w-full rounded-2xl shadow-[0_0_60px_rgba(0,200,255,0.3)] hover:shadow-[0_0_80px_rgba(0,200,255,0.5)] transition-all duration-500 hover:scale-[1.02]"
            />
          </div>

          {/* Login Card */}
          <div className="relative group animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            {/* Main card */}
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x mb-2">
                  DEVCAVE HUB
                </h1>
                <p className="text-sm text-gray-400 uppercase tracking-widest font-mono">
                  Enter the Future
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className="text-xs uppercase tracking-widest text-gray-300 font-bold"
                  >
                    Username
                  </Label>
                  <Input 
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your codename"
                    className="h-12 bg-black/30 border-gray-600/50 focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300 hover:border-gray-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="text-xs uppercase tracking-widest text-gray-300 font-bold"
                  >
                    Password
                  </Label>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-black/30 border-gray-600/50 focus:border-cyan-400 focus:ring-cyan-400/20 text-white placeholder:text-gray-500 rounded-xl transition-all duration-300 hover:border-gray-500"
                  />
                </div>

                {/* Enter button */}
                <Button 
                  className="w-full h-14 text-base font-black uppercase tracking-widest relative overflow-hidden group/btn rounded-xl"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                  
                  {/* Racing stripe animation on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  {/* Button text */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>Enter the Hub</span>
                    <span className="text-2xl">🏁</span>
                  </span>
                </Button>

                {/* Forgot password */}
                <button className="w-full text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300 font-mono">
                  Forgot credentials?
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-500"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-white/40 tracking-widest animate-in fade-in duration-1000 delay-500">
            <img 
              src="/seub-icon.jpg" 
              alt="Seub Germain" 
              className="w-8 h-8 rounded-md shadow-lg"
            />
            <span style={{ fontFamily: 'VT323, monospace' }} className="text-sm">
              Designed - coded with LOVE &lt;3 by SEBASTIEN GERMAIN - ALL RIGHT RESERVED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
