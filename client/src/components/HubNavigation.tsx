import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tv, Image, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function HubNavigation() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const navItems = [
    { path: "/live", label: "LIVE", icon: Tv },
    { path: "/wall", label: "WALL", icon: Image },
    { path: "/board", label: "BOARD", icon: MessageSquare },
  ];

  return (
    <div className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        return (
          <Button
            key={item.path}
            onClick={() => setLocation(item.path)}
            variant={isActive ? "default" : "outline"}
            className={`
              font-mono uppercase tracking-wider
              ${isActive 
                ? "bg-cyan-500/30 text-cyan-400 border-cyan-500" 
                : "bg-transparent text-cyan-400/70 border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
              }
            `}
          >
            <Icon size={16} className="mr-2" />
            {item.label}
          </Button>
        );
      })}
      
      <Button
        onClick={handleLogout}
        variant="outline"
        className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 font-mono uppercase tracking-wider ml-4"
      >
        <LogOut size={16} className="mr-2" />
        EXIT
      </Button>
    </div>
  );
}
