"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2, Video, VideoOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CallModal({ 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <Card className={cn(
        "w-full border-primary/20 bg-card/90 shadow-2xl shadow-primary/20 relative overflow-hidden transition-all duration-500",
        isVideoCall ? "max-w-4xl h-[80vh]" : "max-w-sm"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        {isVideoCall && status === "connected" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-24 right-6 w-48 h-36 rounded-xl border-2 border-primary/50 overflow-hidden shadow-2xl bg-card z-10">
              {isCameraOff ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <VideoOff className="h-8 w-8 text-muted-foreground" />
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

            {/* Overlay for Friend Info */}
            <div className="absolute top-6 left-6 flex items-center space-x-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <Avatar className="h-10 w-10 border border-primary/50">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold uppercase">
                  {friend?.username?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{friend?.username}</span>
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Connected</span>
              </div>
            </div>
          </div>
        ) : (
          <CardHeader className="text-center pt-10 pb-6 relative">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <Avatar className={cn(
                  "h-24 w-24 border-2 border-primary transition-all duration-700",
                  status === "connected" ? "scale-105 border-primary shadow-2xl shadow-primary/20" : "scale-100 border-primary/50"
                )}>
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold uppercase">
                    {friend?.username?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {status === "connected" && (
                  <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-ping pointer-events-none" />
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight mb-2">
              {friend?.username}
            </CardTitle>
            
            <div className="flex items-center justify-center space-x-2">
              {(status === "calling" || status === "connecting") && (
                <Loader2 className="h-4 w-4 animate-spin text-primary opacity-50" />
              )}
              {status === "connected" && (
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {status}
              </p>
            </div>
          </CardHeader>
        )}
        
        <CardContent className={cn(
          "flex flex-col items-center relative",
          isVideoCall ? "absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent" : "pb-12"
        )}>
          <div className="flex items-center space-x-6">
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "rounded-full h-14 w-14 p-0 border-border/50 transition-all hover:scale-110",
                isMuted && "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20"
              )}
              onClick={onMute}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {isVideoCall && (
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "rounded-full h-14 w-14 p-0 border-border/50 transition-all hover:scale-110",
                  isCameraOff && "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20"
                )}
                onClick={onToggleCamera}
              >
                {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
            )}
            
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16 p-0 shadow-xl hover:scale-110 transition-transform shadow-destructive/20"
              onClick={onEnd}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
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
