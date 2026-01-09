import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

interface AuditFormProps {
  onAuditComplete: () => void;
}

export const AuditForm = ({ onAuditComplete }: AuditFormProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to audit",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('audit-website', {
        body: { url, userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Audit Complete!",
          description: "Your website audit has been completed successfully.",
        });
        setUrl("");
        // Add a small delay to ensure DB write completes before triggering refresh
        setTimeout(() => {
          onAuditComplete();
        }, 500);
      }
    } catch (error: any) {
      console.error('Audit error:', error);
      toast({
        title: "Audit Failed",
        description: error.message || "Failed to audit website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Unified pill-shaped input container */}
      <div className="flex items-center bg-card rounded-full shadow-lg border border-border p-1.5 md:p-2 transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20">
        <Input
          type="text"
          placeholder="Enter website URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 h-12 md:h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 md:px-6 placeholder:text-muted-foreground/60"
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-gradient-primary hover:opacity-90 text-white font-semibold text-sm md:text-base transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">AUDIT NOW</span>
              <span className="sm:hidden">AUDIT</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Helper text */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>AI-powered analysis • Comprehensive insights • Instant results</span>
      </div>
    </form>
  );
};
