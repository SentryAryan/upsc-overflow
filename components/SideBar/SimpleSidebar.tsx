"use client";
// components/SideBar/SimpleSidebar.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Award,
  Book,
  FileQuestion,
  HelpCircle,
  Home,
  LucideIcon,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface SidebarItemType {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SimpleSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items?: SidebarItemType[];
}

export function SimpleSidebar({ ...props }: SimpleSidebarProps) {
  console.log("SimpleSidebar.tsx");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  console.log("searchParams =", searchParams);
  console.log("searchParams.toString() =", searchParams.toString());
  console.log("pathname =", pathname);
  console.log("typeof pathname =", typeof pathname);
  const [homePath, setHomePath] = useState<string>("/");
  
  const loggedInSidebarItems: SidebarItemType[] = [
    {
      name: "Home",
      path: homePath,
      icon: Home,
    },
    {
      name: "Ask Question",
      path: "/ask-question",
      icon: FileQuestion,
    },
    {
      name: "Discussions",
      path: "/discussions",
      icon: MessageSquare,
    },
    {
      name: "Resources",
      path: "/resources",
      icon: Book,
    },
    {
      name: "Achievements",
      path: "/achievements",
      icon: Award,
    },
    {
      name: "Community",
      path: "/community",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];
  
  const loggedOutSidebarItems: SidebarItemType[] = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
  ];
  
  const { user, isSignedIn } = useUser();
  const sidebarItems = isSignedIn
    ? loggedInSidebarItems
    : loggedOutSidebarItems;

  useEffect(() => {
    // Only capture and retain filters when user is specifically on the home page
    if (pathname === "/") {
      const searchString = searchParams.toString();
      const fullPath = searchString ? `/?${searchString}` : "/";
      setHomePath(fullPath);
    }
  }, [pathname, searchParams]);

  return (
    <Sidebar
      className="flex flex-col border-r bg-background text-foreground w-64"
      {...props}
    >
      <SidebarHeader className="p-4 h-16 border-b border-border flex items-center justify-center">
        <span className="text-lg font-semibold">UPSC Overflow</span>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-2">
        <SidebarMenu className="space-y-1">
          {sidebarItems.map((item) => {
            // Extract just the pathname part for comparison (ignore search params for active state)
            const itemPathname = item.path.split('?')[0];

            const isActive =
              pathname === itemPathname ||
              (itemPathname !== "/" && pathname.startsWith(itemPathname));

            return (
              <SidebarMenuItem key={item.name} className="rounded-md">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "flex items-center gap-3 w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                    "[&>svg]:h-5 [&>svg]:w-5"
                  )}
                >
                  <Link href={item.path}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq">
            <AccordionTrigger className="flex items-center gap-2 text-sm py-1">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-xs space-y-2 mt-1">
                <Link
                  href="/faq/how-to-ask"
                  className="block hover:text-primary"
                >
                  How to ask questions?
                </Link>
                <Link
                  href="/faq/guidelines"
                  className="block hover:text-primary"
                >
                  Community guidelines
                </Link>
                <Link href="/help" className="block hover:text-primary">
                  Need help?
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarFooter>
    </Sidebar>
  );
}
