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
  if (name && name.trim()) {
    return name.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "U";
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function UserAvatar({
  avatarUrl,
  displayName,
  email,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getInitials(displayName, email);

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2 ring-primary/20 transition-all hover:ring-primary/40", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || email || "User avatar"} />}
      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
