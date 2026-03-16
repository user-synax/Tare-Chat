"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ChatWindow({ friendId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/messages/${friendId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchFriendInfo = async () => {
    try {
      const res = await fetch("/api/friends/list");
      const data = await res.json();
      if (res.ok) {
        const found = data.friends.find((f) => f._id === friendId);
        setFriend(found);
      }
    } catch (err) {
      console.error("Failed to fetch friend info:", err);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    fetchFriendInfo();

    // Polling every 2 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [friendId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: friendId, text }),
      });
      if (res.ok) {
        setText("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background/50">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Loading conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 relative">
      {/* Top Bar */}
      <div className="h-20 border-b border-border/50 bg-card/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm ring-1 ring-border">
            <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold uppercase">
              {friend?.username?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-base font-bold tracking-tight">
              {friend?.username}
            </h2>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-8">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))}
          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-transparent">
        <form
          onSubmit={handleSend}
          className="relative flex items-center space-x-3 bg-card/30 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/20"
        >
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 h-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
          <Button
            type="submit"
            disabled={!text.trim() || sending}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-xl transition-all duration-300",
              text.trim() ? "bg-primary shadow-lg shadow-primary/20 translate-y-[-2px]" : "bg-muted"
            )}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
