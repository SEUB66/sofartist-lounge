import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Trash2, Check, X } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    window.location.href = "/dashboard";
    return null;
  }

  const { data: users, refetch } = trpc.admin.getAllUsers.useQuery();
  
  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("User créé avec succès !");
      setNewUsername("");
      setNewPassword("");
      setNewName("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const toggleAuthMutation = trpc.admin.toggleAuthorization.useMutation({
    onSuccess: () => {
      toast.success("Autorisation mise à jour !");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User supprimé !");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username et password requis");
      return;
    }
    createUserMutation.mutate({
      username: newUsername.toLowerCase(),
      password: newPassword,
      name: newName.trim() || newUsername,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-yellow-500/30 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/dashboard"}
              className="border-yellow-500 text-yellow-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              RETOUR
            </Button>
            <h1 className="text-2xl font-bold text-yellow-300">
              👑 PANEL ADMIN
            </h1>
          </div>
          <div className="text-yellow-300">
            Connecté : <span className="font-bold">{user.username}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {/* Create User Form */}
        <Card className="bg-black/40 backdrop-blur-xl border-yellow-500/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            CRÉER UN NOUVEAU USER
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="username" className="text-yellow-200">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="codename"
                  className="bg-black/50 border-yellow-500/50 text-white"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-yellow-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/50 border-yellow-500/50 text-white"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-yellow-200">Nom (optionnel)</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom complet"
                  className="bg-black/50 border-yellow-500/50 text-white"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
            >
              {createUserMutation.isPending ? "Création..." : "CRÉER USER"}
            </Button>
          </form>
        </Card>

        {/* Users List */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 p-6">
          <h2 className="text-xl font-bold text-purple-300 mb-4">
            LISTE DES USERS ({users?.length || 0})
          </h2>
          <div className="space-y-3">
            {users?.map((u) => (
              <div
                key={u.id}
                className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                  u.role === "admin"
                    ? "bg-yellow-500/10 border-yellow-500"
                    : u.authorized === 1
                    ? "bg-green-500/10 border-green-400"
                    : "bg-purple-500/10 border-purple-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${
                    u.role === "admin"
                      ? "bg-yellow-500"
                      : u.authorized === 1
                      ? "bg-green-400"
                      : "bg-purple-500"
                  }`} />
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {u.customIcon && <span className="text-xl">{u.customIcon}</span>}
                      {u.username}
                      {u.role === "admin" && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {u.name} • ID: {u.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {u.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAuthMutation.mutate({ userId: u.id })}
                      disabled={toggleAuthMutation.isPending}
                      className={
                        u.authorized === 1
                          ? "border-purple-500 text-purple-300 hover:bg-purple-500/20"
                          : "border-green-500 text-green-300 hover:bg-green-500/20"
                      }
                    >
                      {u.authorized === 1 ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          RETIRER
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          AUTORISER
                        </>
                      )}
                    </Button>
                  )}

                  {u.id !== user.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Supprimer ${u.username} ?`)) {
                          deleteUserMutation.mutate({ userId: u.id });
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      className="border-red-500 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
