import connectDB from "@/lib/db";
import Group from "@/models/Group";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, members } = await req.json();
    if (!name || !members || members.length === 0) {
      return NextResponse.json({ error: "Group name and members are required" }, { status: 400 });
    }

    await connectDB();

    const group = await Group.create({
      name,
      members: [...members, session.userId], // Add creator to the group
      admin: session.userId,
    });

    return NextResponse.json({ message: "Group created successfully", group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
