import connectDB from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await connectDB();

    const friend = await User.findOne({ username });
    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (friend._id.toString() === session.userId) {
      return NextResponse.json({ error: "You cannot add yourself as a friend" }, { status: 400 });
    }

    const user = await User.findById(session.userId);
    if (user.friends.includes(friend._id)) {
      return NextResponse.json({ error: "User is already in your friend list" }, { status: 400 });
    }

    user.friends.push(friend._id);
    await user.save();

    return NextResponse.json({ message: "Friend added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Add friend error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
