"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { colors } from "./ui/tokens";

export default function PullToRefresh() {
  const router = useRouter();
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const THRESHOLD = 80;

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY > 0) { setPull(0); return; }
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) setPull(Math.min(dy, THRESHOLD + 20));
    };

    const onTouchEnd = () => {
      if (pull >= THRESHOLD) {
        setRefreshing(true);
        setPull(0);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1200);
      } else {
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pull, router]);

  const show = pull > 0 || refreshing;
  const progress = Math.min(pull / THRESHOLD, 1);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: `${Math.max(pull, refreshing ? 48 : 0)}px`,
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      transition: refreshing ? 'height 200ms ease' : 'none',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: `2px solid ${colors.border}`,
        borderTop: `2px solid ${colors.accent}`,
        borderRadius: '50%',
        transform: `rotate(${progress * 360}deg)`,
        animation: refreshing ? 'spin 600ms linear infinite' : 'none',
        opacity: Math.max(progress, refreshing ? 1 : 0),
        transition: 'opacity 150ms ease',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
