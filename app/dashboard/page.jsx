"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, Users, Loader2, MessageSquare, Settings, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  
  // Settings state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userMessage, setUserMessage] = useState({ text: "", type: "" });

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

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setUsername(data.user.username);
        setEmail(data.user.email || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username,
          email: email,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserMessage({ text: "Profile updated successfully!", type: "success" });
        setUser(data.user);
        localStorage.setItem("username", data.user.username);
      } else {
        setUserMessage({ text: data.error || "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setUserMessage({ text: "Something went wrong", type: "error" });
    } finally {
      setUserLoading(false);
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

  const handleSettingsTabChange = (value) => {
    setActiveTab(value);
    if (value === "settings") {
      fetchUserProfile();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your friends, groups, and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleSettingsTabChange} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="friends" className="flex-1 sm:flex-none">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1 sm:flex-none">
              <MessageSquare className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 sm:flex-none">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal">Add Friend</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFriend} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by username..."
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      className="pl-10 h-11 bg-background border-border"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Add Friend
                  </Button>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="border-border mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal">Your Friends ({friends.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  {friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                      <Users className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm">No friends added yet.</p>
                      <p className="text-xs mt-1">Search for a username above to add them.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <Link key={friend._id} href={`/chat/${friend._id}`}>
                          <div className="flex items-center justify-between p-4 rounded-sm border border-border hover:border-border-light transition-all cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 border border-border">
                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-normal uppercase">
                                  {friend.username.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{friend.username}</span>
                                <span className="text-xs text-muted-foreground">Click to chat</span>
                              </div>
                            </div>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <Card className="border-border">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-normal">Your Groups ({groups.length})</CardTitle>
                <CreateGroupDialog friends={friends} onCreate={handleCreateGroup} />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm">No groups yet.</p>
                      <p className="text-xs mt-1">Create one to start chatting with multiple friends.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groups.map((group) => (
                        <Link key={group._id} href={`/chat/${group._id}?isGroup=true`}>
                          <div className="flex items-center justify-between p-4 rounded-sm border border-border hover:border-border-light transition-all cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 border border-border">
                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-normal uppercase">
                                  <Users className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{group.name}</span>
                                <span className="text-xs text-muted-foreground">{group.members?.length || 0} members</span>
                              </div>
                            </div>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Account Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <Avatar className="h-24 w-24 border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-normal uppercase">
                      {user?.username?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{user?.username}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11 bg-background border-border"
                      placeholder="Your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-background border-border"
                      placeholder="your@email.com"
                    />
                  </div>

                  {userMessage.text && (
                    <div className={cn(
                      "flex items-center space-x-2 p-3 rounded-sm text-xs font-medium",
                      userMessage.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                    )}>
                      <span>{userMessage.text}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={userLoading}
                    >
                      {userLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
