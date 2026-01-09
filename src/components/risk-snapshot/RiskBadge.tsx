import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "low" | "moderate" | "high";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RiskBadge({ level, size = "md", className }: RiskBadgeProps) {
  const labels = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
    lg: "px-5 py-2.5 text-base font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium text-white shadow-sm",
        level === "low" && "bg-risk-low",
        level === "moderate" && "bg-risk-moderate",
        level === "high" && "bg-risk-high",
        sizeClasses[size],
        className
      )}
    >
      {labels[level]}
    </span>
  );
}
