import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScoreCounter } from "@/components/ui/score-counter";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
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
  const categoriesScroll = useScrollAnimation();
  const findingsScroll = useScrollAnimation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 glass-strong border-gradient-animated hover-glow animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 shimmer">{audit.url}</h2>
            <p className="text-sm text-muted-foreground">
              Audited on {new Date(audit.created_at).toLocaleDateString()} at{" "}
              {new Date(audit.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right animate-bounce-in">
            <div className={`text-5xl font-bold ${getScoreColor(audit.overall_score)} animate-glow-pulse`}>
              <ScoreCounter target={audit.overall_score} duration={1500} />
            </div>
            <Badge variant="secondary" className="mt-2 animate-fade-in">
              {getScoreLabel(audit.overall_score)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hover-lift transition-all duration-300 hover:border-primary/50 hover:shadow-glow-sm group"
          >
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Export PDF
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:bg-destructive/10 hover-lift transition-all duration-300 group"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Delete
            </Button>
          )}
        </div>
      </Card>

      {/* Category Scores */}
      <div 
        ref={categoriesScroll.ref}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scroll-reveal ${categoriesScroll.isVisible ? 'revealed' : ''}`}
      >
        {categories.map(({ key, label, icon: Icon }, index) => {
          const score = audit[key] || 0;
          return (
            <Card 
              key={key}
              className="p-6 glass border-gradient-animated hover-lift hover-glow group cursor-pointer transition-all duration-300"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{label}</h3>
                  <p className={`text-2xl font-bold ${getScoreColor(score)} transition-all`}>
                    <ScoreCounter target={score} duration={1000 + index * 100} />
                  </p>
                </div>
              </div>
              <Progress value={score} className="h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000 shimmer" style={{ width: `${score}%` }} />
              </Progress>
            </Card>
          );
        })}
      </div>

      {/* Findings */}
      <div 
        ref={findingsScroll.ref}
        className={`grid grid-cols-1 lg:grid-cols-3 gap-4 scroll-reveal ${findingsScroll.isVisible ? 'revealed' : ''}`}
      >
        {/* Positive Findings */}
        <Card className="p-6 glass hover-lift group transition-all duration-300" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success animate-bounce-in transition-transform group-hover:scale-110" />
            <h3 className="font-semibold text-success">What's Working</h3>
          </div>
          <ul className="space-y-2">
            {findings.positive.map((item: string, index: number) => (
              <li 
                key={index} 
                className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <span className="text-success mt-1 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Issues */}
        <Card className="p-6 glass hover-lift group transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive animate-bounce-in transition-transform group-hover:scale-110" />
            <h3 className="font-semibold text-destructive">Issues Found</h3>
          </div>
          <ul className="space-y-2">
            {findings.issues.map((item: string, index: number) => (
              <li 
                key={index} 
                className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <span className="text-destructive mt-1 font-bold">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 glass hover-lift group transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-warning animate-bounce-in transition-transform group-hover:scale-110" />
            <h3 className="font-semibold text-warning">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {findings.recommendations.map((item: string, index: number) => (
              <li 
                key={index} 
                className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <span className="text-warning mt-1 font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};