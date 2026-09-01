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
          "border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200",
        outline: "text-slate-950 border-slate-200",
        success: "border-transparent bg-emerald-100 text-emerald-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        info: "border-transparent bg-blue-100 text-blue-800",
        purple: "border-transparent bg-purple-100 text-purple-800",
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
      return <Badge variant="warning">📝 Draf / Rencana</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export { Badge, badgeVariants };
