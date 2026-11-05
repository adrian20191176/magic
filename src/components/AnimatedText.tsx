import { useState } from "react";
import type { AnimationEvent, CSSProperties } from "react";

type Line = { id: number; text: string; leaving: boolean };

type Props = {
  text: string;
  className?: string;
  /** Delay (ms) before the very first line starts to appear. */
  initialDelay?: number;
  /** Delay (ms) before a replacement line appears, giving the old one time to leave. */
  swapDelay?: number;
};

/**
 * Text that dissolves out and writes itself back in, word by word.
 * The live region always carries the plain, current text for assistive tech.
 */
export default function AnimatedText({ text, className = "", initialDelay = 0, swapDelay = 180 }: Props) {
  const [lines, setLines] = useState<Line[]>([{ id: 0, text, leaving: false }]);
  const [current, setCurrent] = useState(text);

  if (text !== current) {
    setCurrent(text);
    const lastId = lines[lines.length - 1]?.id ?? 0;
    setLines([
      ...lines.filter((line) => !line.leaving).map((line) => ({ ...line, leaving: true })),
      { id: lastId + 1, text, leaving: false },
    ]);
  }

  const onAnimationEnd = (id: number) => (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget) return;
    setLines((all) => all.filter((line) => line.id !== id || !line.leaving));
  };

  return (
    <p className={`animated-text ${className}`} aria-live="polite">
      <span className="visually-hidden">{text}</span>
      <span className="animated-text__stack" aria-hidden="true">
        {lines.map((line) => {
          const words = line.text.split(" ");
          const style = { "--delay": `${line.id === 0 ? initialDelay : swapDelay}ms` } as CSSProperties;
          return (
            <span
              key={line.id}
              className={`animated-text__line${line.leaving ? " is-leaving" : ""}`}
              style={style}
              onAnimationEnd={onAnimationEnd(line.id)}
            >
              {words.map((word, i) => (
                <span key={i}>
                  <span className="animated-text__word" style={{ "--i": i } as CSSProperties}>
                    {word}
                  </span>
                  {i < words.length - 1 ? " " : null}
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </p>
  );
}
