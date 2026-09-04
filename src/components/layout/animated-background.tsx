"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Subtle Animated Cyber Grid (Dark Mode Only) */}
      <div className="absolute inset-0 bg-cyber-grid opacity-0 dark:opacity-40 transition-opacity duration-700" />

      {/* 2. Fiery Orange & Amber Nebula Waves (Fintech SaaS Style) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-75 mix-blend-screen transition-opacity duration-700">
        {/* Top-Right Glowing Flame Wave */}
        <div className="absolute -top-[25%] right-[5%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br from-orange-600/30 via-amber-600/20 to-rose-700/15 blur-[120px] animate-aurora-1" />
        {/* Center-Left Deep Cyber Indigo-Cyan Accent */}
        <div className="absolute top-[25%] -left-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-amber-500/25 via-orange-600/15 to-rose-900/25 blur-[130px] animate-aurora-2" />
        {/* Bottom Glowing Hearth */}
        <div className="absolute -bottom-[20%] left-[25%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-orange-700/25 via-amber-600/15 to-red-800/15 blur-[140px] animate-aurora-3" />
      </div>

      {/* 3. Light Mode Clean Orbs */}
      <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-300/15 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* 4. Floating Amber/Orange Starlight Particles */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />
      </div>

      {/* 5. Vignette & Obsidian Depth Mask */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(5,5,8,0.65)_100%] opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
}
