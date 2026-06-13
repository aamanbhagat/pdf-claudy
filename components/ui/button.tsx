import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-[var(--ease-out-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-paper hover:bg-ink-soft shadow-soft hover:-translate-y-0.5 hover:shadow-lift",
        accent:
          "bg-iris text-white hover:bg-iris-strong shadow-soft hover:-translate-y-0.5 hover:shadow-iris",
        outline:
          "border border-line bg-surface text-ink hover:border-ink/30 hover:bg-paper-deep",
        ghost: "text-ink hover:bg-paper-deep",
        subtle: "bg-paper-deep text-ink hover:bg-line-soft",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.95rem]",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
