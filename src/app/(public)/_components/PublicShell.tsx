"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PublicSidebar from "./PublicSidebar";
import MobileBottomNav from "./MobileBottomNav";
import UtilityBar from "./UtilityBar";
import CommandPalette from "./CommandPalette";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";
import ChatPageHeader from "../chat/_components/ChatPageHeader";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isChatPage = pathname?.startsWith("/chat") ?? false;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("public-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("public-sidebar-collapsed", collapsed.toString());
    }
  }, [collapsed, mounted]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="lg:pl-[300px]">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 overflow-x-hidden">
      <VisitTracker />

      <PublicSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-[88px]" : "lg:pl-[300px]"
        }`}
      >
        {/* UtilityBar — hidden di chat */}
        {!isChatPage && <UtilityBar onSearchOpen={() => setSearchOpen(true)} />}

        {/* Header chat — cuma di /chat */}
        {isChatPage && (
          <div className="lg:max-w-5xl lg:mx-auto lg:w-full">
            <ChatPageHeader />
          </div>
        )}

        {/* Main content */}
        <main
          className={
            isChatPage
              ? "h-[calc(100dvh-100px)] lg:h-[calc(100dvh-120px)] overflow-hidden"
              : "min-h-screen pb-24 lg:pb-0"
          }
        >
          {children}
        </main>

        {/* Footer — hidden di chat */}
        {!isChatPage && <Footer />}
      </div>

      {/* Mobile bottom nav — hidden di chat */}
      {!isChatPage && (
        <MobileBottomNav onProfileClick={() => setMobileOpen(true)} />
      )}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}