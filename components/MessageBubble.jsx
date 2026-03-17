import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function MessageBubble({ message, isOwn, currentUserId, receiverId, groupId }) {
  const [showPicker, setShowPicker] = useState(false);
  const senderName = message.senderId?.username || "Unknown";

  const handleReact = async (emoji) => {
    try {
      await fetch("/api/messages/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message._id,
          emoji,
          receiverId,
          groupId,
        }),
      });
      setShowPicker(false);
    } catch (err) {
    }
  };

  const reactions = Array.isArray(message.reactions) ? message.reactions : [];
  const reactionGroups = reactions.reduce((acc, r) => {
    if (r && r.emoji) {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "flex w-full mb-4 group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex flex-col max-w-[70%] relative",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && message.groupId && (
          <span className="text-[10px] font-semibold text-muted-foreground ml-2 mb-1 uppercase tracking-wider">
            {senderName}
          </span>
        )}
        <div className="flex items-center gap-2 max-w-full">
          {isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setShowPicker(!showPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              {showPicker && (
                <div className="absolute bottom-full right-0 mb-2 p-1 bg-background border border-border rounded-full shadow-lg flex items-center gap-1 z-50">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="hover:scale-125 transition-transform p-1.5 rounded-full hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div
            className={cn(
              "px-4 py-2 rounded-lg text-sm shadow-sm transition-all hover:shadow-md",
              isOwn
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-secondary text-secondary-foreground rounded-tl-none"
            )}
          >
            <p className="break-words leading-relaxed">{message.text}</p>
            <p
              className={cn(
                "text-[10px] mt-1 opacity-70 text-right",
                isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {format(new Date(message.createdAt), "HH:mm")}
            </p>
          </div>

          {!isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setShowPicker(!showPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              {showPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-1 bg-background border border-border rounded-full shadow-lg flex items-center gap-1 z-50">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="hover:scale-125 transition-transform p-1.5 rounded-full hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            {Object.entries(reactionGroups).map(([emoji, count]) => {
              const hasReacted = reactions.some(r => r && r.userId && r.userId.toString() === currentUserId?.toString() && r.emoji === emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-all",
                    hasReacted 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
