import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const getInitials = (name?: string | null, email?: string) => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export const UserAvatar = ({
  avatarUrl,
  displayName,
  email,
  size = "md",
  className,
}: UserAvatarProps) => {
  const initials = getInitials(displayName, email);

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40 hover:scale-105",
        className
      )}
    >
      <AvatarImage src={avatarUrl || undefined} alt={displayName || email || "User"} />
      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
