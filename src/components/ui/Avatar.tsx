interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export function Avatar({ name, color, size = "md", className = "" }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
