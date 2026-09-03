import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* 3D Floating Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Right Blue Orb */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow" />
        {/* Top-Left Violet Orb */}
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-500/15 dark:bg-purple-600/15 rounded-full blur-3xl animate-float-reverse" />
        {/* Bottom-Center Cyan Orb */}
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-600/10 rounded-full blur-3xl animate-float-slow" />
      </div>

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
