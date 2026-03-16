"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function GroupList({ groups }) {
  const pathname = usePathname();

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground p-4 text-center">
        <p className="text-sm">No groups yet.</p>
        <p className="text-xs mt-1">Create one to start chatting with multiple friends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {groups.map((group) => {
        const isActive = pathname === `/chat/${group._id}`;
        return (
          <Link key={group._id} href={`/chat/${group._id}?isGroup=true`}>
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer hover:bg-accent/50 hover:translate-x-1 group",
                isActive ? "bg-accent shadow-sm" : "bg-transparent"
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm uppercase">
                    <Users className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {group.members?.length || 0} members
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive && "opacity-100"
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
