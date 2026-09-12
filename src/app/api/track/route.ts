import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// Mapping kode negara → nama lengkap
const COUNTRY_NAMES: Record<string, string> = {
  ID: "Indonesia",
  US: "United States",
  SG: "Singapore",
  MY: "Malaysia",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  AU: "Australia",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  CA: "Canada",
  BR: "Brazil",
  RU: "Russia",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Philippines",
  HK: "Hong Kong",
  TW: "Taiwan",
  AE: "UAE",
  SA: "Saudi Arabia",
};

export async function POST(req: NextRequest) {
  try {
    // Ambil geo data dari header Vercel (gratis)
    const countryCode =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "XX"; // fallback
    const city =
      req.headers.get("x-vercel-ip-city") ||
      req.headers.get("cf-ipcity") ||
      null;

    // Decode city kalo ada (Vercel encode URL)
    const decodedCity = city ? decodeURIComponent(city) : null;

    const countryName = COUNTRY_NAMES[countryCode] || countryCode;

    // Simpen ke Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from("site_visits").insert({
      country_code: countryCode,
      country_name: countryName,
      city: decodedCity,
    });

    if (error) {
      console.error("Track error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, country: countryCode });
  } catch (err: any) {
    console.error("Track error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}