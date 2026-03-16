import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

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

    const messageData = {
      senderId: session.userId,
      text,
      readBy: [session.userId] // Sender has always read the message
    };

    if (receiverId) {
      messageData.receiverId = receiverId;
    } else {
      messageData.groupId = groupId;
    }

    const message = await Message.create(messageData);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
