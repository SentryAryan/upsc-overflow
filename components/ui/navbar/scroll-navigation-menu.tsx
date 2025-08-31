"use client";

import { useUser } from "@clerk/nextjs";
import type { Variants } from "framer-motion";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  Book,
  Bookmark,
  FileQuestion,
  Home,
  LucideIcon,
  Menu,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MenuDemo2 from "@/components/Menu/MenuDemo2";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  icon: LucideIcon;
}

interface ScrollNavbarProps {
  className?: string;
}

export const ScrollNavigationMenu: React.FC<ScrollNavbarProps> = ({
  className = "",
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [homePath, setHomePath] = useState<string>("/");
  const [popularTagsPath, setPopularTagsPath] =
    useState<string>("/popular-tags");
  const [popularSubjectsPath, setPopularSubjectsPath] =
    useState<string>("/popular-subjects");
  const [communityPath, setCommunityPath] = useState<string>("/community");
  const [savedPath, setSavedPath] = useState<string>("/saved");

  const menuItems: MenuItem[] = isSignedIn
    ? [
        {
          id: 1,
          title: "Home",
          url: homePath,
          icon: Home,
        },
        {
          id: 2,
          title: "Ask Question",
          url: "/ask-question",
          icon: FileQuestion,
        },
        {
          id: 3,
          title: "Popular Tags",
          url: popularTagsPath,
          icon: Tag,
        },
        {
          id: 4,
          title: "Popular Subjects",
          url: popularSubjectsPath,
          icon: Book,
        },
        {
          id: 5,
          title: "Community",
          url: "/community",
          icon: Users,
        },
        {
          id: 6,
          title: "Saved",
          url: savedPath,
          icon: Bookmark,
        },
      ]
    : [
        {
          id: 1,
          title: "Home",
          url: homePath,
          icon: Home,
        },
        {
          id: 2,
          title: "Popular Tags",
          url: popularTagsPath,
          icon: Tag,
        },
        {
          id: 3,
          title: "Popular Subjects",
          url: popularSubjectsPath,
          icon: Book,
        },
        {
          id: 4,
          title: "Community",
          url: communityPath,
          icon: Users,
        },
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
  }, [pathname, searchParams]);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 100);
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Variant 5 for the popup menu
  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        when: "afterChildren" as const,
        staggerChildren: 0.05,
        staggerDirection: -1 as const,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        when: "beforeChildren" as const,
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants: Variants = {
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8,
    },
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
      },
    },
  } as const;

  const hamburgerVariants = {
    normal: { rotate: 0, scale: 1 },
    scrolled: { rotate: 360, scale: 1.1 },
  };

  return (
    <>
      {/* Full Navbar - visible when not scrolled */}
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isScrolled ? -100 : 0,
          opacity: isScrolled ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border rounded-b-4xl ${className}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={homePath} className="text-2xl font-bold text-foreground">
                Logo
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => {
                  const itemPathname = item.url.split("?")[0];
                  const isActive =
                    pathname === itemPathname ||
                    (itemPathname !== "/" && pathname.startsWith(itemPathname));
                  return (
                    <motion.div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-primary transition-colors",
                          isActive
                            ? "bg-muted text-primary shadow-md font-[900]"
                            : "text-foreground"
                        )}
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        <span>{item.title}</span>
                      </Link>
                      {hoveredItem === item.id && (
                        <motion.div
                          layoutId="navbar-hover"
                          className="absolute inset-0 bg-muted rounded-md -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
                <MenuDemo2 />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                onClick={toggleMenu}
                className="p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Floating Hamburger - visible when scrolled */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isScrolled ? 1 : 0,
          opacity: isScrolled ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-6 right-6 z-50"
      >
        <motion.button
          onClick={toggleMenu}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center cursor-pointer"
          variants={hamburgerVariants}
          animate={isScrolled ? "scrolled" : "normal"}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={toggleMenu}
            />

            {/* Menu Container */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="relative bg-background border border-border rounded-3xl p-8 shadow-2xl min-w-[300px]">
                {/* Close Button */}
                <motion.button
                  onClick={toggleMenu}
                  className="absolute top-4 right-4 p-2 text-foreground hover:text-primary rounded-full hover:bg-muted cursor-pointer"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Menu Items */}
                <div className="space-y-4 mt-8">
                  <MenuDemo2 />
                  {menuItems.map((item, index) => {
                    const itemPathname = item.url.split("?")[0];
                    const isActive =
                      pathname === itemPathname ||
                      (itemPathname !== "/" &&
                        pathname.startsWith(itemPathname));
                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, x: 10 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={item.url}
                          onClick={toggleMenu}
                          className={cn(
                            "flex items-center space-x-4 p-4 rounded-xl hover:bg-muted transition-colors group",
                            isActive
                              ? "bg-muted text-primary shadow-md font-[900]"
                              : "text-foreground"
                          )}
                        >
                          <motion.div
                            className={cn("text-primary")}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.icon && (
                              <item.icon
                                className={cn(
                                  "w-5 h-5 group-hover:text-primary",
                                  isActive
                                    ? "text-primary font-[900]"
                                    : "text-foreground group-hover:text-primary"
                                )}
                              />
                            )}
                          </motion.div>
                          <span
                            className={cn(
                              isActive
                                ? "text-lg text-primary group-hover:text-primary font-[900]"
                                : "text-lg font-medium text-foreground group-hover:text-primary"
                            )}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
