import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const getClerkUserById = async (id: string) => {
  const user = await clerkClient.users.getUser(id);
  return user;
};

export default getClerkUserById;
