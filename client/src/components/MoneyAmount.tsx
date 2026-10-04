import { useLayoutEffect, useRef } from "react";

type MoneyAmountProps = {
  text: string;
};

// MONEY DISPLAY:
// The surrounding element controls the normal font, colour and position.
// This component reduces the font only when the full value cannot fit.
// It never changes the underlying amount or banking calculations.
export default function MoneyAmount({ text }: MoneyAmountProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = textRef.current;
    if (!container || !content) return;

    let disposed = false;

    function fitAmount() {
      if (disposed || !container || !content) return;

      const availableWidth = container.clientWidth;
      if (availableWidth <= 0) return;

      // Read the normal size supplied by the existing page CSS.
      const normalSize = Number.parseFloat(
        window.getComputedStyle(container).fontSize,
      );

      if (!Number.isFinite(normalSize)) return;

      // Do not enlarge text that the page already renders below 12px.
      const minimumSize = Math.min(12, normalSize);
      content.style.fontSize = `${normalSize}px`;

      if (content.getBoundingClientRect().width <= availableWidth) return;

      // Find the largest font size that fits the available space.
      let lower = minimumSize;
      let upper = normalSize;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = (lower + upper) / 2;
        content.style.fontSize = `${candidate}px`;

        if (content.getBoundingClientRect().width <= availableWidth) {
          lower = candidate;
        } else {
          upper = candidate;
        }
      }

      content.style.fontSize = `${lower}px`;
    }

    // Recalculate when the container changes width or web fonts load.
    const observer = new ResizeObserver(fitAmount);
    observer.observe(container);

    document.fonts.addEventListener("loadingdone", fitAmount);
    void document.fonts.ready.then(fitAmount);
    fitAmount();

    return () => {
      disposed = true;
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", fitAmount);
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
        whiteSpace: "nowrap",
        overflowWrap: "normal",
        wordBreak: "normal",

        // Extreme-value fallback:
        // If even the minimum size cannot fit, allow this amount alone
        // to scroll horizontally rather than clipping its digits.
        overflowX: "auto",
      }}
    >
      <span
        ref={textRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </span>
  );
}