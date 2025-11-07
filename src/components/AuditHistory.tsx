import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

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
  const scrollAnimation = useScrollAnimation();

  const fetchAudits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error("Error fetching audits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [refreshTrigger]);

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
      <h3 className="text-lg font-semibold mb-4 animate-slide-up">Recent Audits</h3>
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
              <p className="font-medium truncate group-hover:text-primary transition-colors shimmer">{audit.url}</p>
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