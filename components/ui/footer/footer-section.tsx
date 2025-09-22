"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoaderDemo } from "@/components/Loaders/LoaderDemo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bookmark,
  Facebook,
  FileQuestion,
  Home,
  Instagram,
  Linkedin,
  Tag,
  Twitter,
  Users,
  Book,
  Github,
  Mail,
  Phone,
  MapPin,
  LayoutDashboard,
  Brain,
  MessageCircle,
  PencilLine,
  BookOpenCheck,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SwitchDemo } from "@/components/Switch/SwitchDemo";
import { SubscriptionForm } from "@/components/Forms/SubscriptionForm";
import { cn } from "@/lib/utils";

function Footerdemo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [homePath, setHomePath] = useState<string>("/");
  const [popularTagsPath, setPopularTagsPath] =
    useState<string>("/popular-tags");
  const [popularSubjectsPath, setPopularSubjectsPath] =
    useState<string>("/popular-subjects");
  const [communityPath, setCommunityPath] = useState<string>("/community");
  const [savedPath, setSavedPath] = useState<string>("/saved");
  const [dashboardPath, setDashboardPath] = useState<string>("/dashboard");
  const [chatPath, setChatPath] = useState<string>("/chat");
  const [conversationPath, setConversationPath] =
    useState<string>("/conversation");
  const [testPath, setTestPath] = useState<string>("/test");
  const [allTestsPath, setAllTestsPath] = useState<string>("/allTests");

  const quickLinks = isSignedIn
    ? [
        { name: "Home", url: homePath, icon: Home },
        { name: "Ask Question", url: "/ask-question", icon: FileQuestion },
        { name: "Ask AI", url: chatPath, icon: Brain },
        { name: "Test", url: testPath, icon: PencilLine },
        { name: "All Tests", url: allTestsPath, icon: BookOpenCheck },
        { name: "Conversations", url: conversationPath, icon: MessageCircle },
        { name: "Dashboard", url: dashboardPath, icon: LayoutDashboard },
        { name: "Saved", url: savedPath, icon: Bookmark },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
        { name: "Popular Subjects", url: popularSubjectsPath, icon: Book },
        { name: "Community", url: communityPath, icon: Users },
      ]
    : [
        { name: "Home", url: homePath, icon: Home },
        { name: "Popular Tags", url: popularTagsPath, icon: Tag },
        { name: "Popular Subjects", url: popularSubjectsPath, icon: Book },
        { name: "Community", url: communityPath, icon: Users },
      ];
  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100009205566729",
      icon: Facebook,
    },
    { name: "Twitter", url: "https://x.com/Aryansr38439504", icon: Twitter },
    {
      name: "Instagram",
      url: "https://www.instagram.com/aryansrivastava4693/",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/aryan-srivastava-261974208/",
      icon: Linkedin,
    },
    { name: "Github", url: "https://github.com/SentryAryan", icon: Github },
  ];

  useEffect(() => {
    // Capture and retain filters
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
    if (pathname === "/dashboard") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/dashboard?${searchString}`
        : "/dashboard";
      setDashboardPath(fullPath);
    }
    if (pathname === "/chat") {
      const searchString = searchParams.toString();
      const fullPath = searchString ? `/chat?${searchString}` : "/chat";
      setChatPath(fullPath);
    }
    if (pathname === "/conversation") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/conversation?${searchString}`
        : "/conversation";
      setConversationPath(fullPath);
    }
    if (pathname === "/test") {
      const searchString = searchParams.toString();
      const fullPath = searchString ? `/test?${searchString}` : "/test";
      setTestPath(fullPath);
    }
    if (pathname === "/allTests") {
      const searchString = searchParams.toString();
      const fullPath = searchString
        ? `/allTests?${searchString}`
        : "/allTests";
      setAllTestsPath(fullPath);
    }
  }, [pathname, searchParams]);

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300 mt-10 rounded-t-4xl">
      <div className="w-full px-4 py-12 md:px-8 lg:px-14 xl:px-8">
        <div className="w-full grid gap-12 xl:gap-20 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Stay Connected
            </h2>
            <p className="mb-6 text-muted-foreground">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoaderDemo />
              </div>
            ) : (
              <SubscriptionForm
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>

          {/* Quick Links */}
          <div className="relative flex flex-col">
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-3 text-sm">
              {quickLinks.map((link) => {
                const itemPathname = link.url.split("?")[0];
                const isActive =
                  pathname === itemPathname ||
                  (itemPathname !== "/" && pathname.startsWith(itemPathname));
                return (
                  <Link
                    key={link.name}
                    href={link.url}
                    className={cn(
                      "w-max px-4 py-2 rounded-full flex items-center gap-2 text-sm text-foreground hover:text-primary font-semibold hover:bg-muted  transition-all duration-300 hover:scale-105",
                      isActive
                        ? "bg-muted text-primary shadow-md"
                        : "text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="flex flex-col gap-4 text-sm not-italic">
              {/* Address */}
              <span className="flex flex-col items-start gap-2 flex-wrap">
                <span className="flex items-center gap-2 font-[900]">
                  <MapPin className="h-4 w-4" />
                  <p>Address:</p>
                </span>
                <p>
                  545-KA/RV-494, Ramvihar Para-2 Rajajipuram, Sadar
                  Lucknow(226017)
                </p>
              </span>

              {/* Phone */}
              <span className="flex flex-col items-start gap-2 flex-wrap">
                <span className="flex items-center gap-2 font-[900]">
                  <Phone className="h-4 w-4" />
                  <p>Phone:</p>
                </span>
                <p>8707392404</p>
              </span>

              {/* Email */}
              <span className="flex flex-col items-start gap-2 flex-wrap">
                <span className="flex items-center gap-2 font-[900]">
                  <Mail className="h-4 w-4" />
                  <p>Email:</p>
                </span>
                <p>aryansrivastava4693@gmail.com</p>
              </span>
            </address>
          </div>

          {/* Follow Us */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              {socials.map((social) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full hover:scale-115 hover:bg-muted transition-all duration-300"
                        >
                          <social.icon className="h-4 w-4" />
                          <span className="sr-only">{social.name}</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="cursor-pointer">
                      <Link
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <social.icon className="h-4 w-4" />
                        <p>Follow us on {social.name}</p>
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <SwitchDemo />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 UPSC Overflow. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Cookie Settings
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };
