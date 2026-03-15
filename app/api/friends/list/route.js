import connectDB from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId).populate("friends", "username _id");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ friends: user.friends }, { status: 200 });
  } catch (error) {
    console.error("List friends error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
