import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, groupId, isTyping } = await req.json();

    if (!receiverId && !groupId) {
      return NextResponse.json({ error: "Receiver or Group ID is required" }, { status: 400 });
    }

    let username = session.username;
    if (!username) {
      await connectDB();
      const user = await User.findById(session.userId).select("username");
      if (user) {
        username = user.username;
      }
    }

    const typingData = {
      userId: session.userId,
      username: username || "Someone",
      isTyping,
    };

    if (receiverId) {
      // Direct message: trigger on a channel unique to this pair of users
      const sortedIds = [session.userId, receiverId].sort();
      const channelName = `chat-${sortedIds[0]}-${sortedIds[1]}`;
      await pusherServer.trigger(channelName, "typing", typingData);
    } else if (groupId) {
      // Group message: trigger on the group's channel
      await pusherServer.trigger(`group-${groupId}`, "typing", typingData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
