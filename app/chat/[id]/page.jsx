import ChatWindow from "@/components/ChatWindow";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="flex-1 h-full overflow-hidden">
      <ChatWindow friendId={id} currentUserId={session.userId} />
    </div>
  );
}
