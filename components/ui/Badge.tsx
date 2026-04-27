import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "green" | "yellow" | "gray" | "red" | "blue";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-cb-navy text-white",
    green: "bg-cb-mint text-green-900",
    yellow: "bg-cb-yellow text-yellow-900",
    gray: "bg-gray-200 text-gray-600",
    red: "bg-cb-red text-white",
    blue: "bg-cb-blue text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-inter font-bold uppercase tracking-wide border border-cb-navy",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
