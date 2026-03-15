import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MessageBubble({ message, isOwn }) {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
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
  );
}
