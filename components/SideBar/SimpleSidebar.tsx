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
  Bookmark,
  FileQuestion,
  HelpCircle,
  Home,
  LucideIcon,
  MessageSquare,
  Settings,
  Tag,
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
  const [popularTagsPath, setPopularTagsPath] =
    useState<string>("/popular-tags");
  const [popularSubjectsPath, setPopularSubjectsPath] =
    useState<string>("/popular-subjects");
  const [communityPath, setCommunityPath] = useState<string>("/community");
  const [savedPath, setSavedPath] = useState<string>("/saved");
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
      name: "Popular Tags",
      path: popularTagsPath,
      icon: Tag,
    },
    {
      name: "Popular Subjects",
      path: popularSubjectsPath,
      icon: Book,
    },
    {
      name: "Community",
      path: communityPath,
      icon: Users,
    },
    {
      name: "Saved",
      path: savedPath,
      icon: Bookmark,
    },
    // {
    //   name: "Discussions",
    //   path: "/discussions",
    //   icon: MessageSquare,
    // },
    // {
    //   name: "Resources",
    //   path: "/resources",
    //   icon: Book,
    // },
    // {
    //   name: "Achievements",
    //   path: "/achievements",
    //   icon: Award,
    // },
    // {
    //   name: "Settings",
    //   path: "/settings",
    //   icon: Settings,
    // },
  ];

  const loggedOutSidebarItems: SidebarItemType[] = [
    {
      name: "Home",
      path: homePath,
      icon: Home,
    },
    {
      name: "Popular Tags",
      path: popularTagsPath,
      icon: Tag,
    },
    {
      name: "Popular Subjects",
      path: popularSubjectsPath,
      icon: Book,
    },
    {
      name: "Community",
      path: communityPath,
      icon: Users,
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
    if (pathname === "/popular-tags") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/popular-tags?${searchString}`
        : "/popular-tags";
      setPopularTagsPath(fullPath);
    }
    if (pathname === "/popular-subjects") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/popular-subjects?${searchString}`
        : "/popular-subjects";
      setPopularSubjectsPath(fullPath);
    }
    if (pathname === "/community") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/community?${searchString}`
        : "/community";
      setCommunityPath(fullPath);
    }
    if (pathname === "/saved") {
      const searchString = searchParams.toString();
      const fullPath = searchString ? `/saved?${searchString}` : "/saved";
      setSavedPath(fullPath);
    }
  }, [pathname, searchParams]);

  return (
    <Sidebar
      className="flex flex-col border-2 border-border bg-background text-foreground w-64 shadow-xl"
      {...props}
    >
      <SidebarHeader className="p-4 h-16 border-b-2 border-border flex items-center justify-center bg-background">
        <span className="text-lg font-semibold text-card-foreground">
          UPSC Overflow
        </span>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto p-3 bg-background">
        <SidebarMenu className="space-y-2">
          {sidebarItems.map((item) => {
            // Extract just the pathname part for comparison (ignore search params for active state)
            const itemPathname = item.path.split("?")[0];

            const isActive =
              pathname === itemPathname ||
              (itemPathname !== "/" && pathname.startsWith(itemPathname));

            return (
              <SidebarMenuItem key={item.name} className="rounded-lg">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "flex items-center gap-3 w-full justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border-mode",
                    "hover:bg-accent hover:text-accent-foreground hover:shadow-md font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md border-2 border-primary"
                      : "text-foreground bg-background hover:border-accent",
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

      <SidebarFooter className="p-4 border-t-2 border-border bg-background">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq" className="border-border">
            <AccordionTrigger className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="text-xs space-y-3 mt-1 bg-secondary/50 rounded-lg p-3 border border-border">
                <Link
                  href="/faq/how-to-ask"
                  className="block hover:text-primary transition-colors duration-200 text-muted-foreground hover:bg-accent px-2 py-1 rounded"
                >
                  How to ask questions?
                </Link>
                <Link
                  href="/faq/guidelines"
                  className="block hover:text-primary transition-colors duration-200 text-muted-foreground hover:bg-accent px-2 py-1 rounded"
                >
                  Community guidelines
                </Link>
                <Link
                  href="/help"
                  className="block hover:text-primary transition-colors duration-200 text-muted-foreground hover:bg-accent px-2 py-1 rounded"
                >
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
