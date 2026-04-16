"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, UserPlus, LogOut, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import CreateGroupDialog from "./CreateGroupDialog";
import AccountSection from "./AccountSection";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar({ className }) {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState({ username: "User" });
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends/list");
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends);
      }
    } catch (err) {
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/list");
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchGroups();
    
    // Set user from localStorage after component mounts (client-side only)
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setCurrentUser({ username: storedUsername });
    }
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchUsername) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/friends/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: searchUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchUsername("");
        fetchFriends();
      } else {
        setError(data.error || "Failed to add friend");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name, members) => {
    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, members }),
      });
      if (res.ok) {
        fetchGroups();
      }
    } catch (err) {
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className={cn("flex flex-col h-full border-r border-border bg-card w-full lg:w-80 min-w-0 lg:min-w-80", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-normal tracking-tight">Tare Chat</h1>
          </div>
          <div className="flex items-center space-x-1">
            <AccountSection />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="h-10 w-10 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleAddFriend} className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="pl-10 h-11 bg-background border-border focus:border-primary transition-all"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
          {error && <p className="text-[10px] text-destructive px-1">{error}</p>}
        </form>
      </div>

      <Separator className="bg-border" />

      <div className="px-4 py-4 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">
          Groups
        </p>
        <CreateGroupDialog friends={friends} onCreate={handleCreateGroup} />
      </div>

      <ScrollArea className="h-48">
        <GroupList groups={groups} />
      </ScrollArea>

      <Separator className="bg-border" />

      <div className="px-4 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2 mb-2">
          Friends
        </p>
      </div>

      <ScrollArea className="flex-1">
        <FriendList friends={friends} />
      </ScrollArea>

      <Separator className="bg-border" />
      
      <div className="p-4 bg-card">
        <div className="flex items-center space-x-3 px-2">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarFallback className="bg-primary/5 text-primary text-sm font-normal uppercase">
              {currentUser.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {currentUser.username}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
