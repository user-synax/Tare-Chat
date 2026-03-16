import connectDB from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User"; // Ensure User model is registered
import Group from "@/models/Group"; // Ensure Group model is registered
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, groupId, text } = await req.json();
    console.log("Received send request:", { receiverId, groupId, text: text?.substring(0, 10) + "..." });

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

    console.log("Creating message with data:", JSON.stringify(messageData));

    const message = await Message.create(messageData);
    console.log("Message created successfully:", message._id);
    
    // Fetch the populated message to return
    const populatedMessage = await Message.findById(message._id).populate("senderId", "username").populate("receiverId", "username").populate("groupId", "name");

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    console.error("Detailed Send message error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
