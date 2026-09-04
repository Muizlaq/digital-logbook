import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { AnimatedBackground } from "@/components/layout/animated-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50/80 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden">
      {/* 3D Animated Aurora & Cyber Space Dynamic Background */}
      <AnimatedBackground />

      <Sidebar />
      <div className="relative z-10 flex flex-col flex-1">
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
