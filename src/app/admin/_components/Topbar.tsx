"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function Topbar() {
  const [email, setEmail] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl z-30 flex items-center justify-between px-6">
      <div className="text-sm text-neutral-500">
        Admin <span className="mx-2">/</span>{" "}
        <span className="text-neutral-200">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell (dummy) */}
        <button className="relative text-neutral-400 hover:text-white transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold">
            0
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-1.5 hover:bg-neutral-900 transition"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-neutral-300 hidden md:block">
              {email.split("@")[0]}
            </span>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800">
                <p className="text-xs text-neutral-500">Logged in as</p>
                <p className="text-sm truncate">{email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 transition text-left"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}