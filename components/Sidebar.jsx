"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, UserPlus, LogOut, MessageCircle } from "lucide-react";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import CreateGroupDialog from "./CreateGroupDialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar({ className }) {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends/list");
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
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
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchGroups();
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
      console.error("Failed to create group:", err);
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
    <div className={cn("flex flex-col h-full border-r border-border bg-card/30 backdrop-blur-sm w-full lg:w-80 min-w-0 lg:min-w-80", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Tare Chat</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleAddFriend} className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 shadow-md shadow-primary/10 transition-all hover:translate-y-[-1px]"
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
          {error && <p className="text-[10px] text-destructive px-1">{error}</p>}
        </form>
      </div>

      <Separator className="bg-border/50" />

      <div className="px-4 py-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
          Groups
        </p>
        <CreateGroupDialog friends={friends} onCreate={handleCreateGroup} />
      </div>

      <ScrollArea className="h-48">
        <GroupList groups={groups} />
      </ScrollArea>

      <Separator className="bg-border/50" />

      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
          Friends
        </p>
      </div>

      <ScrollArea className="flex-1">
        <FriendList friends={friends} />
      </ScrollArea>
    </div>
  );
}
