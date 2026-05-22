import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide tabular-nums",
  {
    variants: {
      variant: {
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-[#A07A00] dark:text-warning",
        error: "bg-error/15 text-error",
        info: "bg-info/15 text-info",
        neutral: "bg-surface-container-high text-on-surface-variant",
        primary: "bg-primary/15 text-primary",
        secondary: "bg-secondary/15 text-secondary",
      },
      size: {
        sm: "h-5 px-2 text-[10px]",
        md: "h-5 px-2 text-[11px]",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
