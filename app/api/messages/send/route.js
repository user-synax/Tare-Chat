import connectDB from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User"; // Ensure User model is registered
import Group from "@/models/Group"; // Ensure Group model is registered
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { sendPushNotification } from "@/lib/push";
import { pusherServer } from "@/lib/pusher";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, groupId, text } = await req.json();

    if ((!receiverId && !groupId) || !text) {
      return NextResponse.json({ error: "Receiver/Group and text are required" }, { status: 400 });
    }

    await connectDB();

    if (receiverId && !mongoose.Types.ObjectId.isValid(receiverId)) {
      return NextResponse.json({ error: "Invalid receiver ID" }, { status: 400 });
    }
    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const messageData = {
      senderId: new mongoose.Types.ObjectId(session.userId),
      text,
      readBy: [new mongoose.Types.ObjectId(session.userId)]
    };

    if (receiverId) {
      messageData.receiverId = receiverId;
    } else {
      messageData.groupId = groupId;
    }

    const message = await Message.create(messageData);
    
    // Fetch the populated message to return
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "username")
      .populate("receiverId", "username")
      .populate("groupId", "name");

    // --- Real-time updates with Pusher ---
    if (receiverId) {
      // Direct message: trigger on a channel unique to this pair of users
      // We sort the IDs to ensure both users use the same channel name
      const sortedIds = [session.userId, receiverId].sort();
      const channelName = `chat-${sortedIds[0]}-${sortedIds[1]}`;
      await pusherServer.trigger(channelName, "new-message", populatedMessage);
    } else if (groupId) {
      // Group message: trigger on the group's channel
      await pusherServer.trigger(`group-${groupId}`, "new-message", populatedMessage);
    }

    // Send push notifications (Background)
    if (receiverId) {
      const receiver = await User.findById(receiverId);
      if (receiver && receiver.pushSubscriptions?.length > 0) {
        const pushPromises = receiver.pushSubscriptions.map((sub) =>
          sendPushNotification(sub, {
            title: `New message from ${populatedMessage.senderId.username}`,
            body: text,
            url: `/chat/${session.userId}`
          })
        );
        // Fire and forget or handle errors as needed
        Promise.all(pushPromises).catch(console.error);
      }
    } else if (groupId) {
      const group = await Group.findById(groupId).populate("members");
      if (group) {
        const otherMembers = group.members.filter((m) => m._id.toString() !== session.userId);
        otherMembers.forEach(async (member) => {
          if (member.pushSubscriptions?.length > 0) {
            const pushPromises = member.pushSubscriptions.map((sub) =>
              sendPushNotification(sub, {
                title: `${group.name}: ${populatedMessage.senderId.username}`,
                body: text,
                url: `/chat/${groupId}?isGroup=true`
              })
            );
            Promise.all(pushPromises).catch(console.error);
          }
        });
      }
    }

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
