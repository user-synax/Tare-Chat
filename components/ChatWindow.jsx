"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ArrowLeft, Phone, Users } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  initPeer,
  startLocalStream,
  callUser,
  answerCall,
  endCurrentCall,
  toggleMute,
  destroyPeer,
} from "@/lib/voice";
import IncomingCallDialog from "./IncomingCallDialog";
import VoiceCallModal from "./VoiceCallModal";
import Pusher from "pusher-js";

export default function ChatWindow({ friendId, currentUserId }) {
  const searchParams = useSearchParams();
  const isGroup = searchParams.get("isGroup") === "true";

  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Voice states
  const [peer, setPeer] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);

  const scrollRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // --- Pusher Real-time logic ---
  useEffect(() => {
    if (!currentUserId || !friendId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channelName = isGroup
      ? `group-${friendId}`
      : `chat-${[currentUserId, friendId].sort().join("-")}`;

    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (newMessage) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id.toString() === newMessage._id.toString()
        );
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    channel.bind("typing", (data) => {
      if (data.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const newTypingUsers = { ...prev };
        if (data.isTyping) {
          newTypingUsers[data.userId] = data.username;
        } else {
          delete newTypingUsers[data.userId];
        }
        return newTypingUsers;
      });
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [currentUserId, friendId, isGroup]);

  useEffect(() => {
    if (typeof window !== "undefined" && currentUserId && !isGroup) {
      const p = initPeer(currentUserId);
      setPeer(p);

      const handleCall = (call) => {
        setIncomingCall(call);
      };

      p.on("call", handleCall);

      return () => {
        p.off("call", handleCall);
        destroyPeer();
      };
    }
  }, [currentUserId, isGroup]);

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(
        `/api/messages/${friendId}${isGroup ? "?isGroup=true" : ""}`
      );
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchFriendInfo = async () => {
    try {
      if (isGroup) {
        const res = await fetch("/api/groups/list");
        const data = await res.json();
        if (res.ok) {
          const found = data.groups.find((g) => g._id === friendId);
          if (found) {
            setFriend({
              _id: found._id,
              username: found.name,
              isGroup: true,
              members: found.members,
            });
          }
        }
      } else {
        const res = await fetch("/api/friends/list");
        const data = await res.json();
        if (res.ok) {
          const found = data.friends.find((f) => f._id === friendId);
          setFriend(found);
        }
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchMessages(true);
    fetchFriendInfo();
  }, [friendId, isGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers]);

  const emitTyping = async (isTyping) => {
    if (!friendId || isTypingRef.current === isTyping) return;

    isTypingRef.current = isTyping;
    try {
      await fetch("/api/messages/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isGroup
            ? { groupId: friendId, isTyping }
            : { receiverId: friendId, isTyping }
        ),
      });
    } catch (err) {
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || !friendId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);

    setSending(true);
    try {
      const body = isGroup
        ? { groupId: friendId, text }
        : { receiverId: friendId, text };

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setText("");
        const newMessage = data.message;
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m._id.toString() === newMessage._id.toString()
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
      } else {
        alert(`Failed to send message: ${data.error}`);
      }
    } catch (err) {
    } finally {
      setSending(false);
    }
  };

  const handleStartCall = async () => {
    setCallStatus("calling");
    try {
      const stream = await startLocalStream();
      callUser(friendId, stream, (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        setCallStatus("connected");
      });
    } catch (err) {
      setCallStatus("idle");
    }
  };

  const handleAcceptCall = async () => {
    setCallStatus("connected");
    try {
      const stream = await startLocalStream();
      answerCall(incomingCall, stream, (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });
      setIncomingCall(null);
    } catch (err) {
      setCallStatus("idle");
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    endCurrentCall();
    setCallStatus("idle");
  };

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
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
      <audio ref={remoteAudioRef} autoPlay />

      {incomingCall && (
        <IncomingCallDialog
          callerName={incomingCall.peer.replace("tare-chat-", "")}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {callStatus !== "idle" && (
        <VoiceCallModal
          friend={friend}
          status={callStatus}
          isMuted={isMuted}
          onEnd={handleEndCall}
          onMute={handleToggleMute}
        />
      )}

      {/* Top Bar */}
      <div className="h-20 border-b border-border/50 bg-card/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm ring-1 ring-border">
            <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold uppercase">
              {isGroup ? (
                <Users className="h-6 w-6" />
              ) : (
                friend?.username?.substring(0, 2)
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-base font-bold tracking-tight">
              {friend?.username}
            </h2>
            <div className="flex items-center space-x-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full shadow-sm",
                  isGroup
                    ? "bg-primary"
                    : "bg-green-500 shadow-green-500/50"
                )}
              />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                {isGroup
                  ? `${friend?.members?.length || 0} Members`
                  : "Online"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isGroup && (
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
              onClick={handleStartCall}
            >
              <Phone className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-8">
        <div className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                msg.senderId === currentUserId ||
                msg.senderId?._id === currentUserId ||
                (typeof msg.senderId === "string" &&
                  msg.senderId === currentUserId)
              }
            />
          ))}

          {/* Typing Indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground italic ml-4 animate-pulse">
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
              </div>
              <span>
                {isGroup
                  ? `${Object.values(typingUsers).join(", ")} ${
                      Object.keys(typingUsers).length > 1 ? "are" : "is"
                    } typing...`
                  : "typing..."}
              </span>
            </div>
          )}

          <div ref={scrollRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-card/20 backdrop-blur-md border-t border-border/50">
        <form
          onSubmit={handleSend}
          className="flex items-center space-x-3 max-w-4xl mx-auto"
        >
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={text}
              onChange={handleInputChange}
              className="h-12 bg-background/50 border-border/50 pr-12 focus:ring-primary/20 transition-all rounded-lg"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            disabled={sending || !text.trim()}
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
