"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ArrowLeft, Phone, MoreVertical } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSocket, initSocket } from "@/lib/socket-client";
import { 
  startLocalStream, 
  createPeerConnection, 
  createOffer, 
  createAnswer, 
  handleAnswer, 
  handleIceCandidate, 
  endCall, 
  toggleMute 
} from "@/lib/webrtc";
import IncomingCallDialog from "./IncomingCallDialog";
import VoiceCallModal from "./VoiceCallModal";

export default function ChatWindow({ friendId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendStatus, setFriendStatus] = useState("offline");
  
  // Voice Call States
  const [callStatus, setCallStatus] = useState("idle"); // idle, ringing, connecting, connected
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const socket = getSocket() || initSocket(currentUserId);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${friendId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
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
    fetchMessages();
    fetchFriendInfo();

    if (socket) {
      // Message events
      socket.on("receive_message", (message) => {
        if (message.senderId === friendId || message.receiverId === friendId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on("message_sent", (message) => {
        if (message.receiverId === friendId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      // Typing events
      socket.on("user_typing", ({ userId, isTyping }) => {
        if (userId === friendId) {
          setIsTyping(isTyping);
        }
      });

      // Status events
      socket.on("user_status_change", ({ userId, status }) => {
        if (userId === friendId) {
          setFriendStatus(status);
        }
      });

      socket.on("initial_online_status", (onlineIds) => {
        if (onlineIds.includes(friendId)) {
          setFriendStatus("online");
        }
      });

      // WebRTC Signaling events
      socket.on("incoming_call", ({ offer, from, fromName }) => {
        setIncomingCall({ offer, from, fromName });
      });

      socket.on("webrtc_answer", async ({ answer }) => {
        await handleAnswer(answer);
        setCallStatus("connected");
      });

      socket.on("webrtc_ice_candidate", async ({ candidate }) => {
        await handleIceCandidate(candidate);
      });

      socket.on("call_rejected", () => {
        setCallStatus("idle");
        endCall();
      });

      socket.on("call_ended", () => {
        setCallStatus("idle");
        endCall();
      });
    }

    return () => {
      if (socket) {
        socket.off("receive_message");
        socket.off("message_sent");
        socket.off("user_typing");
        socket.off("user_status_change");
        socket.off("initial_online_status");
        socket.off("incoming_call");
        socket.off("webrtc_answer");
        socket.off("webrtc_ice_candidate");
        socket.off("call_rejected");
        socket.off("call_ended");
      }
    };
  }, [friendId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    socket.emit("send_message", {
      senderId: currentUserId,
      receiverId: friendId,
      text: text.trim(),
    });
    
    setText("");
    setSending(false);
    
    // Stop typing indicator immediately
    socket.emit("typing_stop", { senderId: currentUserId, receiverId: friendId });
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    if (socket) {
      socket.emit("typing_start", { senderId: currentUserId, receiverId: friendId });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { senderId: currentUserId, receiverId: friendId });
      }, 2000);
    }
  };

  // Voice Call Handlers
  const handleStartCall = async () => {
    setCallStatus("ringing");
    const myName = localStorage.getItem("username") || "Someone";
    try {
      await startLocalStream();
      createPeerConnection(socket, friendId, (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });
      const offer = await createOffer(socket, friendId);
      socket.emit("call_user", {
        offer,
        to: friendId,
        from: currentUserId,
        fromName: myName,
      });
    } catch (err) {
      console.error("Call error:", err);
      setCallStatus("idle");
    }
  };

  const handleAcceptCall = async () => {
    setCallStatus("connected");
    try {
      const { offer, from } = incomingCall;
      await startLocalStream();
      createPeerConnection(socket, from, (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });
      await createAnswer(socket, from, offer);
      setIncomingCall(null);
    } catch (err) {
      console.error("Accept call error:", err);
      handleRejectCall();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socket.emit("reject_call", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    socket.emit("end_call", { to: friendId });
    setCallStatus("idle");
    endCall();
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
      {/* Hidden audio element for WebRTC */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Voice Call UI */}
      {incomingCall && (
        <IncomingCallDialog 
          callerName={incomingCall.fromName || "Friend"} 
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
          <Link href="/dashboard" className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm ring-1 ring-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-base font-bold uppercase">
                {friend?.username?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card shadow-sm",
              friendStatus === "online" ? "bg-green-500" : "bg-muted-foreground/30"
            )} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold tracking-tight">
              {friend?.username}
            </h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {friendStatus === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
            onClick={handleStartCall}
            disabled={friendStatus !== "online"}
            title={friendStatus === "online" ? "Start voice call" : "Friend is offline"}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
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
          {isTyping && (
            <div className="flex justify-start mb-4 animate-in slide-in-from-left-2 duration-300">
              <div className="bg-secondary/50 text-muted-foreground px-4 py-2 rounded-2xl rounded-tl-none text-xs flex items-center space-x-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-75">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="ml-1">typing</span>
              </div>
            </div>
          )}
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
            onChange={handleTextChange}
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
