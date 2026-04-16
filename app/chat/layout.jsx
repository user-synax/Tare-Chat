import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
        <div className="absolute top-4 left-4 z-50">
          <Link href="/dashboard">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-sm border border-border bg-card hover:bg-muted transition-all">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
