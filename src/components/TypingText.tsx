"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
};

export default function TypingText({
  phrases,
  typingSpeed = 55,
  deletingSpeed = 25,
  pauseDuration = 1800,
  className = "",
}: Props) {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Stable ref ke phrases biar gak re-run effect
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  useEffect(() => {
    const currentPhrase = phrasesRef.current[phraseIndex] || "";
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrasesRef.current.length);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentPhrase.substring(0, prev.length - 1)
            : currentPhrase.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, typingSpeed, deletingSpeed, pauseDuration]);

  useEffect(() => {
    const id = setInterval(() => setShowCursor((prev) => !prev), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      <span
        className={`inline-block w-[2px] h-[1em] ml-1 rounded-full bg-violet-400 transition-opacity duration-100 ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </span>
  );
}