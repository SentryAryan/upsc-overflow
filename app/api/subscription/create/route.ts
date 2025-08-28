import { NextRequest, NextResponse as res } from "next/server";
import { errorHandler } from "@/lib/helpers/error-handler.helper";
import { generateApiError } from "@/lib/helpers/api-error.helper";
import { generateApiResponse } from "@/lib/helpers/api-response.helper";
import Subscription from "@/db/models/subscription.model";
import { z } from "zod";
import dbConnect from "@/db/dbConnect";

const subscriptionSchema = z.object({
  email: z
    .string({ message: "Email must be a string" })
    .trim()
    .toLowerCase()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email" }),
});

export const POST = errorHandler(async (req: NextRequest) => {
  const validatedData = subscriptionSchema.parse(await req.json());
  const { email } = validatedData;

  await dbConnect();

  const existingSubscription = await Subscription.findOne({ email });

  if (existingSubscription) {
    throw generateApiError(400, "Email already exists", [
      "Email already exists",
    ]);
  }

  const createdSubscription = await Subscription.create({
    email,
  });

  return res.json(
    generateApiResponse(
      201,
      "Subscription created successfully",
      createdSubscription
    ),
    {
      status: 201,
    }
  );
});
