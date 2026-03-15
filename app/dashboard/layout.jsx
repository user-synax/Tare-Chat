import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar className="flex" />
      <main className="flex-1 hidden lg:flex flex-col relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
