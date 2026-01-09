import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, LogOut, Settings } from "lucide-react";
import { AuditForm } from "@/components/AuditForm";
import { AuditResults } from "@/components/AuditResults";
import { AuditHistory } from "@/components/AuditHistory";
import { UserAvatar } from "@/components/UserAvatar";
import { UserProfile } from "@/components/UserProfile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const handleAuditComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectAudit = (audit: any) => {
    setSelectedAudit(audit);
  };

  const handleDeleteAudit = async () => {
    if (!selectedAudit) return;

    try {
      const { error } = await supabase
        .from("audits")
        .delete()
        .eq("id", selectedAudit.id);

      if (error) throw error;

      toast({
        title: "Audit deleted",
        description: "The audit has been removed from your history.",
      });
      setSelectedAudit(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-start)) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-end)) 0%, transparent 70%)'
          }}
        />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-slide-up">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient-primary">
              Landing Page Auditor Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-1 hover:bg-muted rounded-full transition-all duration-300 hover:ring-2 hover:ring-primary/30">
                  <UserAvatar
                    avatarUrl={profile?.avatar_url}
                    displayName={profile?.display_name}
                    email={user?.email}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border shadow-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.display_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer hover:bg-muted">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-destructive/10 text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        {!selectedAudit && (
          <div className="text-center mb-12 space-y-4 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Boost Your{" "}
              <span className="text-gradient-primary">Landing Page Performance</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Get comprehensive insights on conversion optimization, UX/UI, SEO, 
              performance, and compliance powered by AI
            </p>
          </div>
        )}

        {/* Audit Form */}
        {!selectedAudit && (
          <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <AuditForm onAuditComplete={handleAuditComplete} />
          </div>
        )}

        {/* Results or History */}
        {selectedAudit ? (
          <div className="animate-fade-in">
            <Button
              variant="outline"
              className="mb-6 hover-lift transition-all duration-300 hover:border-primary/50 rounded-full px-6"
              onClick={() => setSelectedAudit(null)}
            >
              ← Back to History
            </Button>
            <AuditResults audit={selectedAudit} onDelete={handleDeleteAudit} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <AuditHistory 
              onSelectAudit={handleSelectAudit} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}
      </main>

      <UserProfile 
        open={profileOpen} 
        onOpenChange={(open) => {
          setProfileOpen(open);
          if (!open && user) {
            loadProfile(user.id);
          }
        }} 
      />
    </div>
  );
};

export default Index;
