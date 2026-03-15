import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
  (await cookies()).delete("token");
  return response;
}
