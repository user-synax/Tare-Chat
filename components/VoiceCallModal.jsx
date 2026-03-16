"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2, Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function VoiceCallModal({ 
  friend, 
  onEnd, 
  onMute, 
  onToggleCamera,
  isMuted, 
  isCameraOff,
  status,
  remoteStream,
  localStream,
  isVideoCall
}) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream && isVideoCall) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoCall]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
      <Card className={cn(
        "w-full border-primary/20 bg-card shadow-2xl shadow-primary/20 relative overflow-hidden transition-all duration-700 ease-in-out",
        isVideoCall ? "max-w-4xl h-[85vh] rounded-3xl" : "max-w-sm rounded-3xl"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0" />
        
        {isVideoCall && status === "connected" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Floating) */}
            <div className="absolute bottom-28 right-8 w-56 h-40 rounded-2xl border-2 border-primary/40 overflow-hidden shadow-2xl bg-card z-20 transition-transform hover:scale-105">
              {isCameraOff ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary/80 backdrop-blur-sm">
                  <VideoOff className="h-10 w-10 text-muted-foreground" />
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              )}
            </div>

            {/* Top Overlay for Friend Info */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                <Avatar className="h-12 w-12 border-2 border-primary/50 shadow-lg">
                  <AvatarFallback className="bg-primary/20 text-primary text-base font-bold uppercase">
                    {friend?.username?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white tracking-tight">{friend?.username}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CardHeader className="text-center pt-16 pb-10 relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Avatar className={cn(
                  "h-32 w-32 border-4 border-primary/20 transition-all duration-1000",
                  status === "connected" ? "scale-110 border-primary shadow-2xl shadow-primary/30" : "scale-100"
                )}>
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold uppercase">
                    {friend?.username?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {status === "connected" && (
                  <>
                    <div className="absolute -inset-4 rounded-full border-2 border-primary/20 animate-ping pointer-events-none" />
                    <div className="absolute -inset-8 rounded-full border-2 border-primary/10 animate-ping delay-300 pointer-events-none" />
                  </>
                )}
              </div>
            </div>
            
            <CardTitle className="text-3xl font-black tracking-tight mb-3">
              {friend?.username}
            </CardTitle>
            
            <div className="flex items-center justify-center space-x-3">
              {(status === "calling" || status === "connecting") && (
                <Loader2 className="h-5 w-5 animate-spin text-primary opacity-60" />
              )}
              {status === "connected" && (
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
              )}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {status}
              </p>
            </div>
          </CardHeader>
        )}
        
        {/* Controls */}
        <CardContent className={cn(
          "flex flex-col items-center relative z-20",
          isVideoCall ? "absolute bottom-0 left-0 right-0 pb-10 pt-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent" : "pb-16"
        )}>
          <div className="flex items-center space-x-8">
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "rounded-full h-16 w-16 p-0 border-white/10 transition-all hover:scale-110 active:scale-95 shadow-xl",
                isVideoCall ? "bg-white/10 hover:bg-white/20 text-white" : "bg-secondary/50 hover:bg-secondary text-foreground",
                isMuted && "bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30"
              )}
              onClick={onMute}
            >
              {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </Button>

            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-20 w-20 p-0 shadow-2xl shadow-destructive/40 hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-background"
              onClick={onEnd}
            >
              <PhoneOff className="h-10 w-10" />
            </Button>

            {isVideoCall && (
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "rounded-full h-16 w-16 p-0 border-white/10 transition-all hover:scale-110 active:scale-95 shadow-xl",
                  "bg-white/10 hover:bg-white/20 text-white",
                  isCameraOff && "bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30"
                )}
                onClick={onToggleCamera}
              >
                {isCameraOff ? <VideoOff className="h-7 w-7" /> : <Video className="h-7 w-7" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
