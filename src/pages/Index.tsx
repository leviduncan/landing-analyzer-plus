import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, LogOut } from "lucide-react";
import { AuditForm } from "@/components/AuditForm";
import { AuditResults } from "@/components/AuditResults";
import { AuditHistory } from "@/components/AuditHistory";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Landing Page Auditor Pro
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        {!selectedAudit && (
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Boost Your Landing Page Performance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive insights on conversion optimization, UX/UI, SEO, 
              performance, and compliance powered by AI
            </p>
          </div>
        )}

        {/* Audit Form */}
        {!selectedAudit && (
          <div className="mb-12">
            <AuditForm onAuditComplete={handleAuditComplete} />
          </div>
        )}

        {/* Results or History */}
        {selectedAudit ? (
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => setSelectedAudit(null)}
            >
              ← Back to History
            </Button>
            <AuditResults audit={selectedAudit} onDelete={handleDeleteAudit} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <AuditHistory 
              onSelectAudit={handleSelectAudit} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
