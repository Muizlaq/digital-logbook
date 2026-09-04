"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Subtle Animated Cyber Grid (Dark Mode Only) */}
      <div className="absolute inset-0 bg-cyber-grid opacity-0 dark:opacity-30 transition-opacity duration-700" />

      {/* 2. Flowing Aurora Waves Gradient */}
      <div className="absolute inset-0 opacity-0 dark:opacity-60 mix-blend-screen transition-opacity duration-700">
        <div className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-600/20 to-purple-800/15 blur-[120px] animate-aurora-1" />
        <div className="absolute top-[20%] -right-[15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-bl from-cyan-500/20 via-blue-600/15 to-violet-700/20 blur-[130px] animate-aurora-2" />
        <div className="absolute -bottom-[20%] left-[20%] w-[75vw] h-[75vw] rounded-full bg-gradient-to-tr from-purple-700/20 via-pink-600/10 to-blue-600/15 blur-[140px] animate-aurora-3" />
      </div>

      {/* 3. Light Mode Clean Orbs */}
      <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-300/25 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* 4. Floating Micro-Starlight Particles (Dark Mode) */}
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

      {/* 5. Vignette & Depth Mask for Ultra-Premium Contrast */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(2,6,23,0.45)_100%] opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
}
