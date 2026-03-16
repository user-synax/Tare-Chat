"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff } from "lucide-react";

export default function IncomingCallDialog({ callerName, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-sm border-primary/20 bg-card/90 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-primary animate-pulse">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold uppercase">
                  {callerName?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full border-2 border-card">
                <Phone className="h-3 w-3 text-white fill-current" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Incoming Voice Call
          </CardTitle>
          <p className="text-sm text-muted-foreground animate-pulse">
            {callerName} is calling you...
          </p>
        </CardHeader>
        <CardContent className="flex justify-center space-x-6 pb-8">
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full h-14 w-14 p-0 shadow-lg hover:scale-105 transition-transform"
            onClick={onReject}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 p-0 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:scale-105 transition-transform"
            onClick={onAccept}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
