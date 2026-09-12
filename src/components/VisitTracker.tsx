"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    // Cek udah pernah track di session ini?
    const key = "visitor-tracked";
    if (sessionStorage.getItem(key) === "true") return;

    // Kirim ke API (fire & forget)
    fetch("/api/track", { method: "POST" })
      .then(() => {
        sessionStorage.setItem(key, "true");
      })
      .catch((err) => {
        // Silent fail — jangan ganggu user experience
        console.warn("Tracking failed:", err);
      });
  }, []);

  return null;
}