"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: "comma" | "padStart" | "none";
  padLength?: number;
};

const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export default function Counter({
  end,
  suffix = "",
  prefix = "",
  duration = 1800,
  format = "comma",
  padLength = 2,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setValue(end);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const v = Math.round(end * easeOutExpo(t));
              setValue(v);
              if (t < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const formatted =
    format === "comma"
      ? value.toLocaleString("en-US")
      : format === "padStart"
        ? String(value).padStart(padLength, "0")
        : String(value);

  return (
    <span ref={ref} className="counter-value">
      {prefix && <span className="counter-prefix">{prefix}</span>}
      <span className="counter-digits">{formatted}</span>
      {suffix && <span className="counter-suffix">{suffix}</span>}
    </span>
  );
}
