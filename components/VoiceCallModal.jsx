"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function VoiceCallModal({ 
  friend, 
  onEnd, 
  onMute, 
  isMuted, 
  status 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-primary/20 bg-card/90 shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
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
        
        <CardContent className="flex flex-col items-center pb-12 relative">
          <div className="flex items-center space-x-8">
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
    </div>
  );
}
