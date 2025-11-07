import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Zap, 
  Accessibility, 
  Target, 
  Smartphone, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  Trash2
} from "lucide-react";

interface AuditResultsProps {
  audit: any;
  onDelete?: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  if (score >= 30) return "text-orange-500";
  return "text-destructive";
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Poor";
  return "Critical";
};

const categories = [
  { key: "seo_score", label: "SEO", icon: Search },
  { key: "performance_score", label: "Performance", icon: Zap },
  { key: "accessibility_score", label: "Accessibility", icon: Accessibility },
  { key: "conversion_score", label: "Conversion", icon: Target },
  { key: "mobile_score", label: "Mobile", icon: Smartphone },
  { key: "ux_score", label: "UX/UI", icon: Sparkles },
];

export const AuditResults = ({ audit, onDelete }: AuditResultsProps) => {
  const findings = audit.audit_data?.findings || { positive: [], issues: [], recommendations: [] };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <Card className="p-6 backdrop-blur-xl bg-card/50 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{audit.url}</h2>
            <p className="text-sm text-muted-foreground">
              Audited on {new Date(audit.created_at).toLocaleDateString()} at{" "}
              {new Date(audit.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(audit.overall_score)}`}>
              {audit.overall_score}
            </div>
            <Badge variant="secondary" className="mt-2">
              {getScoreLabel(audit.overall_score)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ key, label, icon: Icon }) => {
          const score = audit[key] || 0;
          return (
            <Card 
              key={key}
              className="p-6 backdrop-blur-xl bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{label}</h3>
                  <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </p>
                </div>
              </div>
              <Progress value={score} className="h-2" />
            </Card>
          );
        })}
      </div>

      {/* Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Positive Findings */}
        <Card className="p-6 backdrop-blur-xl bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-success">What's Working</h3>
          </div>
          <ul className="space-y-2">
            {findings.positive.map((item: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Issues */}
        <Card className="p-6 backdrop-blur-xl bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Issues Found</h3>
          </div>
          <ul className="space-y-2">
            {findings.issues.map((item: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-destructive mt-1">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 backdrop-blur-xl bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-warning">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {findings.recommendations.map((item: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-warning mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};