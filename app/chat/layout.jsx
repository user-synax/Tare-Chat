import Sidebar from "@/components/Sidebar";

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
