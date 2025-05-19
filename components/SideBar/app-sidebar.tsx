// components/SideBar/SimpleSidebar.tsx
import * as React from "react";
import { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the type for navigation items
export interface SidebarItemType {
  name: string;
  path: string;
  icon: LucideIcon;
  isActive?: boolean;
}

interface SimpleSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items: SidebarItemType[];
}

export async function SimpleSidebar({ items, ...props }: SimpleSidebarProps) {
  const user = await currentUser();
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.path} className={cn("flex items-center gap-3")}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <footer className="flex justify-start items-center p-4 gap-4 h-16">
          <SignedOut>
            <SignInButton>
              <Button className="btn-auth">Sign In</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="btn-auth">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton />
              <p className="text-sm text-white">{`${user?.firstName} ${user?.lastName}`}</p>
            </div>
            <SignOutButton>
              <Button className="btn-auth">Sign Out</Button>
            </SignOutButton>
          </SignedIn>
        </footer>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
