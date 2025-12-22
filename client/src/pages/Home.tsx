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

      <Card className="w-[350px] bg-black/40 backdrop-blur-md border-white/10 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
            DEVCAVE BAR
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter the exclusive lounge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username" className="text-gray-200">Username</Label>
                <Input id="username" placeholder="DevOne" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">Cancel</Button>
          <Button className="bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white border-0">Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
