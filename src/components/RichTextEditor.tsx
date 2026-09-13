"use client";

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef, useState } from "react";

const lowlight = createLowlight(common);

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const COLORS = [
  "#ffffff", "#a3a3a3", "#71717a", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

const HIGHLIGHTS = [
  "#fef08a", "#fbcfe8", "#bae6fd", "#bbf7d0",
  "#fed7aa", "#ddd6fe", "#fecaca", "#e9d5ff",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel di sini...",
}: Props) {
  const lastValueRef = useRef(value);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false, // diganti CodeBlockLowlight
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-violet-400 underline" },
      }),
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-4" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
      CharacterCount,
      Typography,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "rounded-lg overflow-hidden my-4" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics.configure({
  katexOptions: {
    throwOnError: false,
  },
}),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-3 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastValueRef.current = html;
      onChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== lastValueRef.current) {
      editor.commands.setContent(value || "");
      lastValueRef.current = value;
    }
  }, [value, editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowTableMenu(false);
      setShowColorMenu(false);
      setShowHighlightMenu(false);
      setShowHeadingMenu(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!editor) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 min-h-[400px] flex items-center justify-center text-neutral-500 text-sm">
        Loading editor...
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
    disabled = false,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md p-2 text-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-violet-500/20 text-violet-300"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-neutral-800 mx-1" />;

  const handleAddLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleAddImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("File terlalu besar. Maksimal 5MB.");
        return;
      }
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `content/${fileName}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (error) {
        alert("Upload gagal: " + error.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    };
    input.click();
  };

  const handleAddYoutube = () => {
    const url = window.prompt("Masukkan URL YouTube:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
    }
  };

  const isInTable = editor.isActive("table");

  // Heading label
  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
    ? "H2"
    : editor.isActive("heading", { level: 3 })
    ? "H3"
    : editor.isActive("heading", { level: 4 })
    ? "H4"
    : "Paragraph";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
      {/* ============ TOOLBAR ============ */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-800 bg-neutral-900/50 p-2 sticky top-0 z-20 backdrop-blur-xl">
        {/* UNDO/REDO */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </ToolbarButton>

        <Divider />

        {/* HEADING DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowHeadingMenu(!showHeadingMenu);
            }}
            className="rounded-md px-3 py-2 text-sm transition flex items-center gap-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white min-w-[100px]"
            title="Heading"
          >
            <span className="font-medium">{headingLabel}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {showHeadingMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full mt-2 left-0 z-50 w-44 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
            >
              {[
                { label: "Paragraph", action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph") },
                { label: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
                { label: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
                { label: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
                { label: "Heading 4", action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), active: editor.isActive("heading", { level: 4 }) },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setShowHeadingMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    item.active
                      ? "bg-violet-500/10 text-violet-300 font-medium"
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* TEXT FORMATTING */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <code className="text-xs">&lt;/&gt;</code>
        </ToolbarButton>

        {/* TEXT COLOR */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowColorMenu(!showColorMenu);
              setShowHighlightMenu(false);
            }}
            className="rounded-md p-2 text-sm transition flex flex-col items-center text-neutral-400 hover:bg-neutral-800 hover:text-white"
            title="Text Color"
          >
            <span className="text-xs font-bold leading-none">A</span>
            <span
              className="w-4 h-1 rounded-sm mt-0.5"
              style={{
                backgroundColor: editor.getAttributes("textStyle").color || "#ffffff",
              }}
            />
          </button>
          {showColorMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full mt-2 left-0 z-50 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl p-3"
            >
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Text Color
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorMenu(false);
                    }}
                    className="w-7 h-7 rounded-md border border-neutral-800 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorMenu(false);
                }}
                className="w-full mt-2 rounded-md px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              >
                Reset Color
              </button>
            </div>
          )}
        </div>

        {/* HIGHLIGHT */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowHighlightMenu(!showHighlightMenu);
              setShowColorMenu(false);
            }}
            className={`rounded-md p-2 text-sm transition ${
              editor.isActive("highlight")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
            title="Highlight"
          >
            <span className="inline-block bg-yellow-300/40 px-1 rounded text-xs font-bold">
              🖍
            </span>
          </button>
          {showHighlightMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full mt-2 left-0 z-50 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl p-3"
            >
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Highlight
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color }).run();
                      setShowHighlightMenu(false);
                    }}
                    className="w-7 h-7 rounded-md border border-neutral-800 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setShowHighlightMenu(false);
                }}
                className="w-full mt-2 rounded-md px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              >
                Reset Highlight
              </button>
            </div>
          )}
        </div>

        {/* SUBSCRIPT / SUPERSCRIPT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive("subscript")}
          title="Subscript"
        >
          <span className="text-xs">
            X<sub>2</sub>
          </span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive("superscript")}
          title="Superscript"
        >
          <span className="text-xs">
            X<sup>2</sup>
          </span>
        </ToolbarButton>

        <Divider />

        {/* ALIGNMENT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M17 10H3M21 6H3M21 14H3M17 18H3" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 10H6M21 6H3M21 14H3M18 18H6" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 10H7M21 6H3M21 14H3M21 18H7" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 10H3M21 6H3M21 14H3M21 18H3" />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* LISTS */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
          title="Task List"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <rect x="3" y="5" width="6" height="6" rx="1" />
            <path d="M5 8l1.5 1.5L9 6M13 8h8M13 16h8M3 17l2 2 4-4" />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* BLOCK ELEMENTS */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          {"{ }"}
          <ToolbarButton
  onClick={() => {
    const latex = window.prompt(
      "Masukkan rumus LaTeX:\n\nContoh:\n• x^2 + y^2 = z^2\n• \\frac{a}{b}\n• \\sum_{i=1}^{n} x_i",
      "x^2 + y^2 = z^2"
    );
    if (latex) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "inlineMath",
          attrs: { latex: latex.trim() },
        })
        .run();
    }
  }}
  title="Sisipkan Rumus"
>
  Σ
</ToolbarButton>
        </ToolbarButton>

        {/* TABLE */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowTableMenu(!showTableMenu);
              setShowColorMenu(false);
              setShowHighlightMenu(false);
            }}
            title="Table"
            className={`rounded-md p-2 text-sm transition flex items-center gap-1 ${
              isInTable
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
          </button>
          {showTableMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full mt-2 left-0 z-50 w-56 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
            >
              <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/60">
                Insert Table
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setShowTableMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white transition"
              >
                📊 Tabel 3×3
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run();
                  setShowTableMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white transition"
              >
                📊 Tabel 4×4
              </button>

              {isInTable && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-t border-b border-neutral-800/60 mt-1">
                    Edit Table
                  </div>
                  <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➕ Kolom Kanan</button>
                  <button type="button" onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➕ Kolom Kiri</button>
                  <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➕ Baris Bawah</button>
                  <button type="button" onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➕ Baris Atas</button>
                  <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➖ Hapus Kolom</button>
                  <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">➖ Hapus Baris</button>
                  <button type="button" onClick={() => { editor.chain().focus().mergeCells().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">🔗 Gabung Cell</button>
                  <button type="button" onClick={() => { editor.chain().focus().splitCell().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">✂️ Pecah Cell</button>
                  <button type="button" onClick={() => { editor.chain().focus().toggleHeaderRow().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900 transition">🎨 Toggle Header Row</button>
                  <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 transition border-t border-neutral-800/60">🗑️ Hapus Tabel</button>
                </>
              )}
            </div>
          )}
        </div>

        <Divider />

        {/* MEDIA */}
        <ToolbarButton onClick={handleAddLink} active={editor.isActive("link")} title="Add Link">
          🔗
        </ToolbarButton>
        <ToolbarButton onClick={handleAddImage} title="Tambah Gambar">
          🖼️
        </ToolbarButton>
        <ToolbarButton onClick={handleAddYoutube} title="YouTube Video">
          ▶️
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          —
        </ToolbarButton>

        <Divider />

        {/* CLEAR FORMAT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Hapus Semua Format"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M4 7h16M10 11v6M14 11v6M5 7l1-2h12l1 2M8 21h8" />
          </svg>
        </ToolbarButton>
      </div>

      {/* ============ BUBBLE MENU ============ */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl p-1"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("bold")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("italic")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("underline")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("strike")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <s>S</s>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("highlight")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            🖍
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
              editor.isActive("code")
                ? "bg-violet-500/20 text-violet-300"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <code className="text-xs">&lt;/&gt;</code>
          </button>
          <div className="w-px h-5 bg-neutral-800 mx-0.5" />
          <button
            type="button"
            onClick={handleAddLink}
            className="rounded-md px-2.5 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            🔗
          </button>
        </BubbleMenu>
      )}

      {/* ============ EDITOR ============ */}
      <EditorContent editor={editor} />

      {/* ============ STATUS BAR ============ */}
      <div className="border-t border-neutral-800 bg-neutral-900/30 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            {editor.storage.characterCount.characters()} karakter
          </span>
          <span className="text-neutral-700">·</span>
          <span className="tabular-nums">
            {editor.storage.characterCount.words()} kata
          </span>
          <span className="text-neutral-700">·</span>
          <span className="tabular-nums">
            ~{Math.max(1, Math.ceil(editor.storage.characterCount.words() / 200))} menit baca
          </span>
        </div>
        <span className="text-neutral-600 hidden md:block">
          💡 Select teks buat bubble menu
        </span>
      </div>
    </div>
  );
}