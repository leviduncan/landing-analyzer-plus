import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserAndProfile();
  }, [open]);

  const loadUserAndProfile = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      setUser(currentUser);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
      }
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });

      loadUserAndProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2097152) {
        toast({
          title: "Error",
          description: "File size must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });

      loadUserAndProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription>Update your profile information and avatar</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
              email={user?.email}
              size="lg"
            />

            <div className="flex gap-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </span>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Label>

              {profile?.avatar_url && (
                <Button variant="ghost" size="icon" onClick={handleRemoveAvatar} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="glass-card border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="glass-card border-white/10 opacity-60" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
