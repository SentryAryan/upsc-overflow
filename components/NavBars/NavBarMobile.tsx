"use client";

import { Book, Bookmark, FileQuestion, Home, Tag, Users } from "lucide-react";
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
  const [popularSubjectsPath, setPopularSubjectsPath] =
    useState<string>("/popular-subjects");
  const [communityPath, setCommunityPath] = useState<string>("/community");
  const [savedPath, setSavedPath] = useState<string>("/saved");
  const navItems = isSignedIn
    ? [
        { name: "Home", url: homePath, icon: Home },
        { name: "Ask Question", url: "/ask-question", icon: FileQuestion },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
        { name: "Popular Subjects", url: popularSubjectsPath, icon: Book },
        { name: "Community", url: communityPath, icon: Users },
        { name: "Saved", url: savedPath, icon: Bookmark },
      ]
    : [
        { name: "Home", url: homePath, icon: Home },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
        { name: "Popular Subjects", url: popularSubjectsPath, icon: Book },
        { name: "Community", url: communityPath, icon: Users },
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

  return <NavBar items={navItems} className={className} />;
}
