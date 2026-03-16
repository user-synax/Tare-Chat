import connectDB from "@/lib/db";
import Group from "@/models/Group";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const groups = await Group.find({ members: session.userId }).populate("members", "username _id");

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    console.error("List groups error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
