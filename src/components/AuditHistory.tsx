import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <Card className="p-8 text-center backdrop-blur-xl bg-card/50 border-border/50">
        <p className="text-muted-foreground">
          No audits yet. Start by auditing your first website!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Recent Audits</h3>
      {audits.map((audit) => (
        <Card
          key={audit.id}
          className="p-4 backdrop-blur-xl bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-all duration-300"
          onClick={() => onSelectAudit(audit)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{audit.url}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(audit.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getScoreColor(audit.overall_score)}>
              {audit.overall_score}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};