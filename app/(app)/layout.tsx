"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
  Wand2Icon, // ✅ AI Background Removal Icon
  UserIcon // ✅ Face Detection Icon
} from "lucide-react";

// ✅ Sidebar Menu (Now Fully Vertical)
const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
  { href: "/image-transformation", icon: ImageIcon, label: "Image Transformation" },
  { href: "/background-removal", icon: Wand2Icon, label: "Background Removal" },
  { href: "/face-detection", icon: UserIcon, label: "Face Detection" }, // 🔥 Face Detection Feature
  { href: "/auto-tagging", icon: ImageIcon, label: "AI Auto-Tagging" }, // 🔥 Auto-Tagging Feature
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen"> {/* ✅ Sidebar takes full height */}
      {/* Sidebar - Full Height */}
      <div className="bg-base-200 w-64 flex flex-col justify-between min-h-screen">
        {/* Sidebar Header */}
        <div className="flex items-center justify-center py-4">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>

        {/* Sidebar Menu Items */}
        <ul className="menu p-4 w-full text-base-content flex-grow space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-lg font-medium ${
                  pathname === item.href ? "bg-primary text-white" : "hover:bg-base-300"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Sign Out Button at Bottom */}
        {user && (
          <div className="p-4">
            <button onClick={handleSignOut} className="btn btn-outline btn-error w-full">
              <LogOutIcon className="mr-2 h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-base-200">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
            <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost lg:hidden">
              <MenuIcon />
            </label>
            <Link href="/" className="btn btn-ghost normal-case text-2xl font-bold tracking-tight">
              Cloudinary Showcase
            </Link>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img src={user.imageUrl} alt={user.username || user.emailAddresses[0].emailAddress} />
                  </div>
                </div>
                <span className="text-sm truncate max-w-xs lg:max-w-md">
                  {user.username || user.emailAddresses[0].emailAddress}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
