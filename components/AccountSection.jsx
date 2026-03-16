"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountSection() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [open, setOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setUsername(data.user.username);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (username === user?.username) {
      setMessage({ text: "No changes to update", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username, 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setUser(data.user);
        // Update localStorage if needed
        localStorage.setItem("username", data.user.username);
      } else {
        setMessage({ text: data.error || "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
          title="Account Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <span>My Account</span>
          </DialogTitle>
        </DialogHeader>
        
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            <p className="mt-4 text-sm text-muted-foreground">Loading details...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6 py-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl">
                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold uppercase">
                  {user?.username?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-bold">{user?.username}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold ml-1">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                  placeholder="Your username"
                />
              </div>
            </div>

            {message.text && (
              <div className={cn(
                "flex items-center space-x-2 p-3 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-1",
                message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
              )}>
                {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full h-11 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
