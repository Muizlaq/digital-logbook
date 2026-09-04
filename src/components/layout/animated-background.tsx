"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic import for WebGL Three.js to guarantee SSR safety
const KineticRibbon3D = dynamic(
  () => import("./kinetic-ribbon-3d").then((mod) => mod.KineticRibbon3D),
  { ssr: false }
);

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Deep Midnight Studio Background Gradient (Matching Dribbble Reference) */}
      <div className="absolute inset-0 bg-[#020617] dark:bg-[#030718] transition-colors duration-700" />

      {/* 2. 3D Kinetic Satin Ribbon Sculpture (Dark Mode Primary) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-85 transition-opacity duration-1000">
        <KineticRibbon3D />
      </div>

      {/* 3. Subtle Cyber-Grid & Ambient Studio Lighting */}
      <div className="absolute inset-0 bg-cyber-grid opacity-0 dark:opacity-25 transition-opacity duration-700" />

      {/* 4. Ambient Studio Glow Orbs (Complementing the 3D Ribbon) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-50 mix-blend-screen pointer-events-none transition-opacity duration-700">
        <div className="absolute -top-[20%] left-[10%] w-[65vw] h-[65vw] rounded-full bg-blue-600/15 blur-[140px] animate-aurora-1" />
        <div className="absolute -bottom-[20%] right-[5%] w-[70vw] h-[70vw] rounded-full bg-indigo-600/15 blur-[150px] animate-aurora-2" />
        <div className="absolute top-[30%] left-[35%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[130px] animate-aurora-3" />
      </div>

      {/* 5. Light Mode Ambient Pastel Style */}
      <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-300/25 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* 6. Floating Micro-Starlight Particles */}
      <div className="absolute inset-0 opacity-0 dark:opacity-75 transition-opacity duration-700">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />
      </div>

      {/* 7. Soft Vignette for Enhanced Content Contrast */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(3,7,24,0.4)_100%] opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
}
