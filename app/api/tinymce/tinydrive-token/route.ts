import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

const privateKey = process.env.TINY_CLOUD_PRIVATE_KEY || "";

export async function POST(request: NextRequest) {
  // // CORS headers
  // const headers = {
  //   "Access-Control-Allow-Origin": "*",
  //   "Access-Control-Allow-Methods": "POST, OPTIONS",
  //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //   "Content-Type": "application/json",
  // };

  // if (request.method === "OPTIONS") {
  //   return new NextResponse(null, {
  //     status: 200,
  //     headers,
  //   });
  // }

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user: User | null = await currentUser();

    const payload = {
      sub: user?.id,
      name:
        user?.username ||
        user?.firstName ||
        user?.lastName ||
        user?.emailAddresses[0]?.emailAddress ||
        user?.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    };

    const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating JWT token:", error.message);

    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}

// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   });
// }
