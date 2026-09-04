import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow",
        secondary:
          "border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300",
        destructive:
          "border-rose-200 dark:border-rose-900/50 bg-rose-100/90 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
        outline: "text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-white/[0.1]",
        success: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
        warning: "border-amber-200 dark:border-amber-900/50 bg-amber-100/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
        info: "border-orange-200 dark:border-orange-900/50 bg-orange-100/90 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300",
        purple: "border-purple-200 dark:border-purple-900/50 bg-purple-100/90 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
      return <Badge variant="success">✅ Selesai</Badge>;
    case "IN_PROGRESS":
    case "SUBMITTED":
    case "REVIEW":
      return <Badge variant="info">⚡ Sedang Berjalan</Badge>;
    case "DRAFT":
    case "REJECTED":
      return <Badge variant="secondary">📝 Draf / Rencana</Badge>;
    case "SICK":
      return <Badge variant="destructive">🏥 Sakit</Badge>;
    case "PERMISSION":
      return <Badge variant="warning">📄 Izin / Cuti</Badge>;
    case "HOLIDAY":
      return <Badge variant="purple">🏖️ Libur</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export { Badge, badgeVariants };
