import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Radio, Tv, MessageSquare, Image as ImageIcon, Settings } from "lucide-react";

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
            variant={activeModule === "radio" ? "default" : "outline"}
            onClick={() => setActiveModule("radio")}
            className={activeModule === "radio" ? "bg-purple-600" : ""}
          >
            <Radio className="w-4 h-4 mr-2" />
            RADIO
          </Button>
          <Button
            variant={activeModule === "tv" ? "default" : "outline"}
            onClick={() => setActiveModule("tv")}
            className={activeModule === "tv" ? "bg-purple-600" : ""}
          >
            <Tv className="w-4 h-4 mr-2" />
            TV
          </Button>
          <Button
            variant={activeModule === "board" ? "default" : "outline"}
            onClick={() => setActiveModule("board")}
            className={activeModule === "board" ? "bg-purple-600" : ""}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            BOARD
          </Button>
          <Button
            variant={activeModule === "wall" ? "default" : "outline"}
            onClick={() => setActiveModule("wall")}
            className={activeModule === "wall" ? "bg-purple-600" : ""}
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
          {activeModule === "radio" && (
            <div className="text-center text-white">
              <Radio className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-3xl font-bold mb-4">MODULE RADIO</h2>
              <p className="text-gray-400">Upload MP3, créer des playlists, écouter ensemble</p>
              <p className="text-sm text-purple-400 mt-4">🚧 En construction... 🚧</p>
            </div>
          )}

          {activeModule === "tv" && (
            <div className="text-center text-white">
              <Tv className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-3xl font-bold mb-4">MODULE TV</h2>
              <p className="text-gray-400">Upload vidéos/images, TV partagée old school</p>
              <p className="text-sm text-purple-400 mt-4">🚧 En construction... 🚧</p>
            </div>
          )}

          {activeModule === "board" && (
            <div className="text-center text-white">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-3xl font-bold mb-4">MODULE BOARD</h2>
              <p className="text-gray-400">Tableau d'affichage, messages, annonces</p>
              <p className="text-sm text-purple-400 mt-4">🚧 En construction... 🚧</p>
            </div>
          )}

          {activeModule === "wall" && (
            <div className="text-center text-white">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-3xl font-bold mb-4">MODULE WALL</h2>
              <p className="text-gray-400">Galerie multimédia complète (images, vidéos, audio, PDF)</p>
              <p className="text-sm text-purple-400 mt-4">🚧 En construction... 🚧</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
