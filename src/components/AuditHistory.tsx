import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useToast } from "@/hooks/use-toast";

interface AuditHistoryProps {
  onSelectAudit: (audit: any) => void;
  refreshTrigger?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-success/10 text-success border-success/20";
  if (score >= 70) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 50) return "bg-warning/10 text-warning border-warning/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
};

export const AuditHistory = ({ onSelectAudit, refreshTrigger }: AuditHistoryProps) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollAnimation = useScrollAnimation();
  const { toast } = useToast();

  const fetchAudits = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, skipping audit fetch");
        return;
      }

      console.log("Fetching audits for user:", user.id);
      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching audits:", error);
        throw error;
      }
      
      console.log("Fetched audits:", data?.length || 0);
      setAudits(data || []);
      
      if (isManualRefresh) {
        toast({
          title: "Refreshed",
          description: `Found ${data?.length || 0} audits`,
        });
      }
    } catch (error: any) {
      console.error("Error fetching audits:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch audits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchAudits(true);
  };

  useEffect(() => {
    fetchAudits();
  }, [refreshTrigger]);

  // Set up real-time subscription for new audits
  useEffect(() => {
    const channel = supabase
      .channel('audits-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audits'
        },
        (payload) => {
          console.log('New audit received via realtime:', payload);
          // Add the new audit to the beginning of the list
          setAudits(prev => [payload.new as any, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary animate-glow-pulse" />
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <Card className="p-8 text-center glass animate-bounce-in">
        <p className="text-muted-foreground">
          No audits yet. Start by auditing your first website!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3" ref={scrollAnimation.ref}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold animate-slide-up">Recent Audits</h3>
        <Button
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {audits.map((audit, index) => (
        <Card
          key={audit.id}
          className={`p-4 glass cursor-pointer hover-lift hover-glow group transition-all duration-300 hover:border-primary/50 scroll-reveal ${scrollAnimation.isVisible ? 'revealed' : ''}`}
          onClick={() => onSelectAudit(audit)}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            animationFillMode: 'both'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-foreground group-hover:text-primary transition-colors shimmer">{audit.url}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(audit.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`${getScoreColor(audit.overall_score)} transition-transform group-hover:scale-110 animate-scale-pulse`}>
              {audit.overall_score}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};