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
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter website URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 bg-secondary/50 border-border h-12 text-base"
        />
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Audit Now
            </>
          )}
        </Button>
      </div>
    </form>
  );
};