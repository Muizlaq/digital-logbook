import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive:
          "border-transparent bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 border-rose-200 dark:border-rose-900/50",
        outline: "text-slate-950 dark:text-slate-100 border-slate-200 dark:border-slate-800",
        success: "border-transparent bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
        warning: "border-transparent bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
        info: "border-transparent bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
        purple: "border-transparent bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
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
      return <Badge variant="info">⚡ Sedang Dikerjakan</Badge>;
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
