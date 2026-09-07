"use client";

import React, { memo } from "react";

export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transform-gpu will-change-transform">
      {/* 1. Subtle Animated Cyber Grid (Dark Mode Only) */}
      <div className="absolute inset-0 bg-cyber-grid opacity-0 dark:opacity-30 transition-opacity duration-700" />

      {/* 2. Fiery Orange & Amber Nebula Waves (Hardware Accelerated) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-60 transition-opacity duration-700 pointer-events-none">
        {/* Top-Right Glowing Flame Wave */}
        <div className="absolute -top-[20%] right-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-orange-600/25 via-amber-600/15 to-transparent blur-3xl transform-gpu animate-aurora-1" />
        {/* Center-Left Deep Accent */}
        <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-amber-500/20 via-orange-600/10 to-transparent blur-3xl transform-gpu animate-aurora-2" />
        {/* Bottom Glowing Hearth */}
        <div className="absolute -bottom-[15%] left-[30%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-orange-700/20 via-amber-600/10 to-transparent blur-3xl transform-gpu animate-aurora-3" />
      </div>

      {/* 3. Light Mode Clean Glow */}
      <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-400/10 rounded-full blur-2xl transform-gpu" />
        <div className="absolute top-1/3 -left-32 w-72 h-72 bg-amber-300/10 rounded-full blur-2xl transform-gpu" />
      </div>

      {/* 4. Vignette & Obsidian Depth Mask */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(5,5,8,0.5)_100%] opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
});
