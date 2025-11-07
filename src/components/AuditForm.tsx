import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";

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
        onAuditComplete();
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
      <div className="flex gap-2 p-2 rounded-xl glass border-gradient-animated">
        <Input
          type="text"
          placeholder="Enter website URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 glass-strong border-0 h-12 text-base focus:ring-2 focus:ring-primary/50 transition-all duration-300 focus:shadow-glow-sm"
        />
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow-md transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
                <span className="inline-flex ml-1">
                  <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                Audit Now
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>
    </form>
  );
};