import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const expectedUser = process.env.DASHBOARD_USER || "admin";
  const expectedPass = process.env.DASHBOARD_PASS || "admin";

  if (username === expectedUser && password === expectedPass) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("ops-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
