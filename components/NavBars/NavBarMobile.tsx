"use client";

import { FileQuestion, Home, Tag } from "lucide-react";
import { NavBar } from "@/components/ui/tube-light-navbar";
import { useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBarMobile({ className }: { className?: string }) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [homePath, setHomePath] = useState<string>("/");
  const [popularTagsPath, setPopularTagsPath] =
    useState<string>("/popular-tags");
  const navItems = isSignedIn
    ? [
        { name: "Home", url: homePath, icon: Home },
        { name: "Ask Question", url: "/ask-question", icon: FileQuestion },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
      ]
    : [
        { name: "Home", url: homePath, icon: Home },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
      ];

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
  }, [pathname, searchParams]);

  return <NavBar items={navItems} className={className} />;
}
