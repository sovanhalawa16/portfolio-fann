"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-p:my-2 prose-p:leading-relaxed prose-p:text-neutral-200
      prose-headings:text-white prose-headings:font-bold
      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
      prose-h1:mt-4 prose-h1:mb-2 prose-h2:mt-3 prose-h2:mb-1.5 prose-h3:mt-2 prose-h3:mb-1
      prose-strong:text-white prose-strong:font-semibold
      prose-em:text-neutral-300
      prose-code:text-violet-300 prose-code:bg-neutral-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
      prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-lg prose-pre:p-3 prose-pre:my-2 prose-pre:text-xs
      prose-pre:overflow-x-auto
      prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5
      prose-li:my-0.5 prose-li:text-neutral-200
      prose-blockquote:border-l-2 prose-blockquote:border-violet-500 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-neutral-400 prose-blockquote:my-2
      prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
      prose-table:text-xs prose-table:border-collapse
      prose-th:border prose-th:border-neutral-800 prose-th:px-2 prose-th:py-1 prose-th:bg-neutral-950
      prose-td:border prose-td:border-neutral-800 prose-td:px-2 prose-td:py-1
      prose-hr:border-neutral-800 prose-hr:my-3
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}