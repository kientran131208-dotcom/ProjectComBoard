import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "mint" | "yellow";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-poppins font-bold border-2 border-cb-navy transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-cb-red text-white shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
      secondary: "bg-white text-cb-navy shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
      ghost: "bg-transparent text-cb-navy shadow-hard-sm hover:bg-gray-50",
      mint: "bg-cb-mint text-green-900 shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
      yellow: "bg-cb-yellow text-yellow-900 shadow-hard hover:shadow-hard-lg hover:-translate-x-0.5 hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded",
      md: "text-sm px-4 py-2.5 rounded",
      lg: "text-base px-6 py-3.5 rounded",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Đang xử lý...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
