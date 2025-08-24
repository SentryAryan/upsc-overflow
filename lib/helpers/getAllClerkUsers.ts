import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const getAllClerkUsers = async () => {
  const users = await clerkClient.users.getUserList();
  return users;
};

export default getAllClerkUsers;
