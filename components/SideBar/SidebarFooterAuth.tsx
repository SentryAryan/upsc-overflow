import { Button } from "@/components/ui/button";
import {
 SignInButton,
 SignOutButton,
 SignUpButton,
 SignedIn,
 SignedOut,
 UserButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function SidebarFooterAuth() {
  const user = await currentUser();

  return (
    <>
      <SignedOut>
        <div className="flex justify-center items-center gap-2">
          <SignInButton>
            <Button size="sm" className="w-full">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size="sm" className="w-full">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <UserButton />
            <p className="text-sm text-white">{`${user?.firstName} ${user?.lastName}`}</p>
          </div>
          <SignOutButton>
            <Button size="sm" variant="outline">
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </SignedIn>
    </>
  );
} 