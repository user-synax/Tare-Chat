import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { pusherServer } from "@/lib/pusher";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, emoji, receiverId, groupId } = await req.json();

    if (!messageId || !emoji) {
      return NextResponse.json({ error: "Message ID and emoji are required" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === session.userId && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // User is removing their reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ emoji, userId: session.userId });
    }

    // Use a direct update to ensure persistence
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $set: { reactions: message.reactions } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedMessage) {
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
    }

    const reactionData = {
      messageId,
      reactions: updatedMessage.reactions,
    };

    // Calculate channel name consistently with ChatWindow.jsx
    let channelName;
    if (groupId) {
      channelName = `group-${groupId}`;
    } else if (receiverId) {
      const sortedIds = [session.userId, receiverId].sort();
      channelName = `chat-${sortedIds[0]}-${sortedIds[1]}`;
    } else {
      // Fallback to message data if receiverId/groupId not provided
      if (updatedMessage.groupId) {
        channelName = `group-${updatedMessage.groupId}`;
      } else {
        const senderIdStr = updatedMessage.senderId._id ? updatedMessage.senderId._id.toString() : updatedMessage.senderId.toString();
        const receiverIdStr = updatedMessage.receiverId._id ? updatedMessage.receiverId._id.toString() : updatedMessage.receiverId.toString();
        const sortedIds = [senderIdStr, receiverIdStr].sort();
        channelName = `chat-${sortedIds[0]}-${sortedIds[1]}`;
      }
    }

    await pusherServer.trigger(channelName, "reaction-update", reactionData);

    return NextResponse.json({ success: true, reactions: updatedMessage.reactions });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
