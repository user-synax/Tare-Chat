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
    if (!friendId) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 });
    }

    await connectDB();

    // Fetch messages between current user and friend
    const messages = await Message.find({
      $or: [
        { senderId: session.userId, receiverId: friendId },
        { senderId: friendId, receiverId: session.userId },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
