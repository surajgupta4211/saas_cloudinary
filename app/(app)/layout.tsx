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
  SearchIcon, // ✅ AI Content Analysis Icon
  Wand2Icon, // ✅ AI Background Removal Icon
  UserIcon, // ✅ Face Detection Icon
  ShrinkIcon // ✅ Alternative Icon for Compression

} from "lucide-react";

// ✅ Sidebar Menu (Now Fully Vertical)
const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
  { href: "/image-transformation", icon: ImageIcon, label: "Image Transformation" },
  // { href: "/background-removal", icon: Wand2Icon, label: "Background Removal" },
  { href: "/color-enhancement", icon: ImageIcon, label: "AI Auto Color" }, // ✅ New Feature Added
  { href: "/face-detection", icon: UserIcon, label: "Face Detection" }, // 🔥 Face Detection Feature
  // { href: "/auto-tagging", icon: ImageIcon, label: "AI Auto-Tagging" }, // 🔥 Auto-Tagging Feature
  //{ href: "/content-analysis", icon: SearchIcon, label: "AI Content Analysis" }, // ✅ New Feature Added
  { href: "/image-compression", icon: ShrinkIcon, label: "Image Compression" }, // 🔥 Fixed Icon

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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="bg-base-200 w-64 flex flex-col justify-between min-h-screen">
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
        {/* Page Content */}
        <main className="flex-grow p-6">{children}</main>
      </div>
    </div>
  );
}
