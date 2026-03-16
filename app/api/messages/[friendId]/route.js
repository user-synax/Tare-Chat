import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId } = await params;
    const { searchParams } = new URL(req.url);
    const isGroup = searchParams.get('isGroup') === 'true';

    if (!friendId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    await connectDB();

    let messages;
    if (isGroup) {
      messages = await Message.find({ groupId: friendId })
        .populate("senderId", "username")
        .sort({ createdAt: 1 });
    } else {
      messages = await Message.find({
        $or: [
          { senderId: session.userId, receiverId: friendId },
          { senderId: friendId, receiverId: session.userId },
        ],
      })
        .populate("senderId", "username")
        .sort({ createdAt: 1 });
    }

    // Mark messages as read
    const unreadMessageIds = messages
      .filter(msg => msg.senderId.toString() !== session.userId && !msg.readBy.includes(session.userId))
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { readBy: session.userId } }
      );
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
