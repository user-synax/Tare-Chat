import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MessageBubble({ message, isOwn }) {
  const senderName = message.senderId?.username || "Unknown";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex flex-col max-w-[70%]">
        {!isOwn && message.groupId && (
          <span className="text-[10px] font-semibold text-muted-foreground ml-2 mb-1 uppercase tracking-wider">
            {senderName}
          </span>
        )}
        <div
          className={cn(
            "px-4 py-2 rounded-2xl text-sm shadow-sm",
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
      </div>
    </div>
  );
}
