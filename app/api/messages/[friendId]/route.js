import connectDB from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import Group from "@/models/Group";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId } = await params;
    const { searchParams } = new URL(req.url);
    const isGroup = searchParams.get('isGroup') === 'true';

    if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await connectDB();

    let messages;
    if (isGroup) {
      messages = await Message.find({ groupId: friendId })
        .populate("senderId", "username")
        .sort({ createdAt: 1 })
        .lean();
    } else {
      messages = await Message.find({
        $or: [
          { senderId: session.userId, receiverId: friendId },
          { senderId: friendId, receiverId: session.userId },
        ],
      })
        .populate("senderId", "username")
        .sort({ createdAt: 1 })
        .lean();
    }

    // Mark messages as read
    const unreadMessageIds = messages
      .filter(msg => {
        const senderId = msg.senderId._id ? msg.senderId._id.toString() : msg.senderId.toString();
        return senderId !== session.userId && !msg.readBy.some(id => id.toString() === session.userId);
      })
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { readBy: new mongoose.Types.ObjectId(session.userId) } }
      );
    }

    // Ensure reactions field exists for all messages
    const processedMessages = messages.map(msg => ({
      ...msg,
      reactions: msg.reactions || []
    }));

    return NextResponse.json({ messages: processedMessages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
