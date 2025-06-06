// components/TypingText.tsx
"use client";

import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypingText({
  text,
  speed = 30,
  onComplete,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let idx = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[idx]);
      idx += 1;
      if (idx >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  // Use a <span> instead of <p> so you can nest it inside a <p> or other inline block.
  return <span className="whitespace-pre-wrap">{displayed}</span>;
}
