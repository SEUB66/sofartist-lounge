import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UnicornBackground from "@/components/UnicornBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <UnicornBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Custom Neon Frame Login Container - Centered */}
      <div className="relative w-[500px] h-[800px] flex flex-col items-center justify-center z-10 mx-auto">
        
        {/* The Neon Frame Background Image */}
        <img 
          src="/login-frame.png" 
          alt="Login Interface" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
        />

        {/* Content Overlay */}
        <div className="relative w-full h-full flex flex-col items-center pt-[10%]">
          
          {/* Title Area */}
          <div className="mb-8 text-center z-20">
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] uppercase">
              DevCave Bar
            </h1>
            <p className="text-cyan-300 tracking-widest text-sm font-bold mt-2 uppercase drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
              Access Terminal
            </p>
          </div>

          {/* Form Container */}
          <form className="w-[60%] flex flex-col items-center mt-4 h-full relative">
            
            {/* Username Field - Top Frame (Blue) */}
            <div className="absolute top-[8%] w-full flex flex-col items-center space-y-2">
              <Label htmlFor="username" className="text-cyan-400 font-bold uppercase tracking-widest text-xs drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                Identity
              </Label>
              <Input 
                id="username" 
                placeholder="CODENAME" 
                className="bg-transparent border-none text-center text-white text-xl font-mono placeholder:text-cyan-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 w-full" 
              />
            </div>

            {/* Password Field - Bottom Frame (Pink) */}
            <div className="absolute top-[48%] w-full flex flex-col items-center space-y-2">
              <Label htmlFor="password" className="text-pink-500 font-bold uppercase tracking-widest text-xs drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]">
                Passphrase
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="bg-transparent border-none text-center text-white text-xl font-mono placeholder:text-pink-500/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 w-full" 
              />
            </div>

            {/* Login Button */}
            <div className="absolute bottom-[15%] w-full flex justify-center">
              <Button className="px-12 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white font-bold tracking-widest uppercase transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Enter System
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
