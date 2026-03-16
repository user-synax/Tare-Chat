"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FriendList({ friends }) {
  const pathname = usePathname();

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <p className="text-sm">No friends added yet.</p>
        <p className="text-xs mt-1">Search for a username to add them.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {friends.map((friend) => {
        const isActive = pathname === `/chat/${friend._id}`;
        return (
          <Link key={friend._id} href={`/chat/${friend._id}`}>
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer hover:bg-accent/50 group",
                isActive ? "bg-accent" : "bg-transparent"
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm uppercase">
                    {friend.username.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {friend.username}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Click to chat
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
