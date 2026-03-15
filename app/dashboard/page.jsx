import { MessageCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
      <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-2xl shadow-primary/5">
        <MessageCircle className="h-12 w-12 text-primary opacity-20" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-3">Welcome to Tare Chat</h2>
      <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
        Select a friend from the sidebar to start a conversation or search for a username to add new friends.
      </p>
    </div>
  );
}
