import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "teal" | "amber" | "red" | "green" | "gray" | "dark";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  teal: "bg-brand-teal-light text-brand-teal-dark",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-600",
  green: "bg-emerald-100 text-emerald-700",
  gray: "bg-gray-100 text-gray-500",
  dark: "bg-brand-charcoal text-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
