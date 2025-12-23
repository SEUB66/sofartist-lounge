import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Radio, Tv, MessageSquare, Image as ImageIcon, Settings, FolderOpen } from "lucide-react";

type Module = "radio" | "tv" | "board" | "wall";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>("radio");

  if (!user) {
    window.location.href = "/";
    return null;
  }

  const isAuthorized = user.authorized === 1;
  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/apple-punk-logo.png" alt="Apple Punk" className="h-12" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DEVCAVE HUB
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Status Badge */}
            <div className={`px-4 py-2 rounded-lg border-2 ${
              isAdmin ? "bg-yellow-500/20 border-yellow-500 text-yellow-300" :
              isAuthorized ? "bg-green-500/20 border-green-400 text-green-300" :
              "bg-purple-500/20 border-purple-500 text-purple-300"
            }`}>
              <div className="flex items-center gap-2">
                {user.customIcon && <span className="text-xl">{user.customIcon}</span>}
                <span className="font-bold">{user.username}</span>
                {isAdmin && <span className="text-xs">(ADMIN)</span>}
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/admin"}
                className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                ADMIN
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="border-red-500 text-red-300 hover:bg-red-500/20"
            >
              EXIT
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-purple-500/20 p-4">
        <div className="container mx-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/live"}
          >
            <Radio className="w-4 h-4 mr-2" />
            RADIO
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/tv"}
          >
            <Tv className="w-4 h-4 mr-2" />
            TV
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/board"}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            BOARD
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/wall"}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            WALL
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        {!isAuthorized && !isAdmin && (
          <div className="mb-8 p-6 bg-purple-500/20 border-2 border-purple-500 rounded-lg">
            <h2 className="text-xl font-bold text-purple-300 mb-2">
              🔒 ACCÈS LIMITÉ
            </h2>
            <p className="text-purple-200">
              Tu dois être autorisé par un admin pour pouvoir uploader du contenu.
              En attendant, tu peux consulter tout le contenu partagé !
            </p>
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-lg p-8 min-h-[600px]">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              WELCOME TO DEVCAVE HUB
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Choisissez un module ci-dessus pour commencer
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => window.location.href = "/live"}>
                <Radio className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">RADIO</h3>
                <p className="text-sm text-gray-400">MP3 Playlist</p>
              </div>
              <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => window.location.href = "/tv"}>
                <Tv className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">TV</h3>
                <p className="text-sm text-gray-400">Videos & Images</p>
              </div>
              <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => window.location.href = "/board"}>
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">BOARD</h3>
                <p className="text-sm text-gray-400">Messages</p>
              </div>
              <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => window.location.href = "/wall"}>
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">WALL</h3>
                <p className="text-sm text-gray-400">Gallery</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 rounded-lg border-2 border-fuchsia-500/60 hover:border-fuchsia-400 transition-all cursor-pointer" onClick={() => window.location.href = "/library"}>
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-fuchsia-400" />
                <h3 className="text-xl font-bold mb-2">MY LIBRARY</h3>
                <p className="text-sm text-gray-400">Personal Assets</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
