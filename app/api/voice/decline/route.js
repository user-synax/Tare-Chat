import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { callerId, calleeId } = await req.json();
    if (!callerId || !calleeId) {
      return NextResponse.json({ error: "Caller and Callee IDs are required" }, { status: 400 });
    }
    const declineData = {
      declinedBy: session.userId,
      declinedByName: session.username || "Someone",
    };

    // The channel for voice events should be specific to the user being called
    const channelName = `user-${callerId}`;
    await pusherServer.trigger(channelName, "call-declined", declineData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
