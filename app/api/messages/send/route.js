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

    const { receiverId, text } = await req.json();
    if (!receiverId || !text) {
      return NextResponse.json({ error: "Receiver and text are required" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.create({
      senderId: session.userId,
      receiverId,
      text,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
