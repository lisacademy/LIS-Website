import { useEffect, useState, useRef } from "react";
import { getSection } from "@/lib/contentDb";
import { AlertCircle } from "lucide-react";

export const MARQUEE_HEIGHT = 36;

interface MarqueeStripProps {
  fixed?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function MarqueeStrip({ fixed = false, onHeightChange }: MarqueeStripProps) {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSection("marquee").then((data) => {
      if (data.text) setText(data.text);
      if (data.enabled === "false") setEnabled(false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    onHeightChange?.(enabled && text ? MARQUEE_HEIGHT : 0);
  }, [enabled, onHeightChange, text]);

  if (!enabled || !text) return null;

  // Duplicate the text so the marquee loops seamlessly
  const repeated = `${text}&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;${text}&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;${text}`;

  return (
    <div
      className={`${fixed ? "fixed left-0 right-0 top-0 z-[60]" : "relative z-10"} overflow-hidden select-none`}
      style={{
        background: "linear-gradient(90deg, #b91c1c 0%, #dc2626 40%, #b91c1c 100%)",
        height: MARQUEE_HEIGHT,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Static label */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 z-10"
        style={{
          background: "rgba(0,0,0,0.25)",
          height: "100%",
          borderRight: "1px solid rgba(255,255,255,0.2)",
          minWidth: 110,
        }}
      >
        <AlertCircle size={12} className="text-white" />
        <span className="text-white font-bold text-[10px] tracking-widest uppercase whitespace-nowrap">
          Upcoming
        </span>
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={trackRef}
          className="flex whitespace-nowrap"
          style={{
            animation: paused ? "none" : "lisMarquee 10s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          <span
            className="text-white font-semibold px-6"
            style={{ fontSize: 14, letterSpacing: "0.02em" }}
            dangerouslySetInnerHTML={{ __html: repeated }}
          />
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes lisMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
