"use client";

import { useState, useEffect } from "react";
import PublicSidebar from "./PublicSidebar";
import MobileBottomNav from "./MobileBottomNav";
import UtilityBar from "./UtilityBar";
import CommandPalette from "./CommandPalette";
import Footer from "@/components/Footer";
import VisitTracker from "@/components/VisitTracker";
import VisitorCountries from "@/components/VisitorCountries";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        <UtilityBar onSearchOpen={() => setSearchOpen(true)} />

        <main className="min-h-screen pb-24 lg:pb-0">{children}</main>

        {/* ✅ VISITOR COUNTRIES — SECTION DI ATAS FOOTER */}
        <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
          <VisitorCountries />
        </section>

        <Footer />
      </div>

      <MobileBottomNav onProfileClick={() => setMobileOpen(true)} />

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}