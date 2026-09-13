import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    // ============================================
    // 1. VALIDASI API KEY
    // ============================================
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("❌ GROQ_API_KEY gak ada di env");
      return jsonError(
        500,
        "GROQ_API_KEY belum diset",
        "Tambahin di .env.local: GROQ_API_KEY=gsk_xxx, terus restart server"
      );
    }

    if (!apiKey.startsWith("gsk_")) {
      console.error("❌ GROQ_API_KEY format salah");
      return jsonError(
        500,
        "GROQ_API_KEY format salah",
        "Groq API key harus mulai dengan 'gsk_'. Cek di console.groq.com/keys"
      );
    }

    // ============================================
    // 2. PARSE BODY
    // ============================================
    let body: { messages: Message[]; sessionId: string };
    try {
      body = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON body");
    }

    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonError(400, "Messages harus array dan gak boleh kosong");
    }

    // ============================================
    // 3. AMBIL SETTINGS DARI SUPABASE
    // ============================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return jsonError(500, "Supabase env vars missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error: settingsError } = await supabase
      .from("chat_settings")
      .select("key, value")
      .in("key", ["ai_system_prompt", "ai_model", "ai_enabled"]);

    if (settingsError) {
      console.error("⚠️ Settings fetch error:", settingsError);
    }

    const config = (settings || []).reduce<Record<string, string>>(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {}
    );

    if (config.ai_enabled === "false") {
      return jsonError(403, "AI sedang dinonaktifkan oleh admin");
    }

    const systemPrompt =
      config.ai_system_prompt ||
      "Kamu adalah Fann AI, asisten virtual yang ramah dan helpful untuk website portfolio Sovantri Putra Paskah Halawa (Fann). Jawab dengan santai, ramah, dan pake bahasa Indonesia casual.";

    const model = config.ai_model || "openai/gpt-oss-20b";

    console.log(`🤖 Request: model="${model}", messages=${messages.length}`);

    // ============================================
    // 4. INIT GROQ
    // ============================================
    const groq = new Groq({ apiKey });

    // ============================================
    // 5. STREAMING RESPONSE
    // ============================================
    let stream;
    try {
      stream = await groq.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });
    } catch (groqError: any) {
      // === LOG DETAIL KE TERMINAL ===
      console.error("❌ Groq Error DETAIL:", {
        message: groqError?.message,
        status: groqError?.status,
        code: groqError?.code,
        error: groqError?.error,
        type: groqError?.type,
      });

      // 401 = API key invalid
      if (groqError?.status === 401) {
        return jsonError(
          401,
          "Groq API key invalid atau expired",
          "Bikin key baru di console.groq.com/keys → update .env.local → restart server"
        );
      }

      // 429 = Rate limit
      if (groqError?.status === 429) {
        return jsonError(
          429,
          "Rate limit Groq tercapai",
          "Tunggu 1 menit, Groq gratis ada limit per menit"
        );
      }

      // 404 = Model gak ada
      if (
        groqError?.status === 404 ||
        groqError?.message?.includes("does not exist") ||
        groqError?.message?.includes("not found")
      ) {
        return jsonError(
          404,
          `Model "${model}" gak valid`,
          "Cek daftar model di console.groq.com/docs/models"
        );
      }

      // 400 = Bad request (bisa model salah, param salah, dll)
      if (groqError?.status === 400) {
        return jsonError(
          400,
          `Request ke Groq ditolak: ${groqError?.message || "Bad request"}`,
          `Model: "${model}". Cek model ID-nya di console.groq.com/docs/models`
        );
      }

      // Error umum — tampilin pesan asli
      return jsonError(
        500,
        groqError?.message || "Groq error",
        `Status: ${groqError?.status || "unknown"} · Model: ${model}`
      );
    }

    // ============================================
    // 6. CONVERT STREAM
    // ============================================
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          console.log(`✅ Response sent: ${fullResponse.length} chars`);

          // Save conversation ke DB (fire & forget)
          if (sessionId && fullResponse.trim()) {
            saveConversation(supabase, sessionId, messages, fullResponse).catch(
              (err) => console.error("Save convo error:", err)
            );
          }
        } catch (streamError: any) {
          console.error("❌ Stream error:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", {
      message: error?.message,
      stack: error?.stack?.slice(0, 500),
    });
    return jsonError(
      500,
      error?.message || "Unexpected error",
      "Cek terminal buat detail"
    );
  }
}

// ============================================
// HELPERS
// ============================================

function jsonError(status: number, error: string, hint?: string) {
  return new Response(JSON.stringify({ error, hint }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function saveConversation(
  supabase: any,
  sessionId: string,
  userMessages: Message[],
  assistantResponse: string
) {
  try {
    const { data: existing } = await supabase
      .from("ai_conversations")
      .select("id, messages, total_messages")
      .eq("session_id", sessionId)
      .maybeSingle();

    const newAssistantMessage = {
      role: "assistant",
      content: assistantResponse,
      created_at: new Date().toISOString(),
    };

    const lastUserMessage =
      userMessages.filter((m) => m.role === "user").slice(-1)[0] || null;

    if (existing) {
      const updatedMessages = [
        ...(existing.messages as any[]),
        ...(lastUserMessage ? [lastUserMessage] : []),
        newAssistantMessage,
      ];

      await supabase
        .from("ai_conversations")
        .update({
          messages: updatedMessages,
          total_messages: (existing.total_messages || 0) + 2,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("ai_conversations").insert({
        session_id: sessionId,
        messages: [
          ...(lastUserMessage ? [lastUserMessage] : []),
          newAssistantMessage,
        ],
        total_messages: 2,
      });
    }
  } catch (err) {
    console.error("saveConversation error:", err);
  }
}