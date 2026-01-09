import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, FileText } from "lucide-react";
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
    let currentUserId: string | null = null;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserId = user?.id ?? null;
    });

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
          // Only add audits for the current user
          if (!currentUserId || (payload.new as any).user_id !== currentUserId) {
            console.log('Ignoring audit for different user');
            return;
          }
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
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <Card className="p-8 md:p-12 text-center border shadow-card animate-bounce-in">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No audits yet</h3>
        <p className="text-muted-foreground">
          Start by auditing your first website above!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 relative z-10" ref={scrollAnimation.ref}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold animate-slide-up">Recent Audits ({audits.length})</h3>
        <Button
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full px-4 hover:border-primary/50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-3">
        {audits.map((audit, index) => (
          <Card
            key={audit.id}
            className="p-4 md:p-5 border shadow-card cursor-pointer hover-lift hover:border-primary/30 group transition-all duration-300 revealed"
            onClick={() => onSelectAudit(audit)}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                  {audit.url}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(audit.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Badge className={`${getScoreColor(audit.overall_score)} transition-transform group-hover:scale-110 font-semibold text-sm px-3 py-1`}>
                {audit.overall_score}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
