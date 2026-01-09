import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScoreCounter } from "@/components/ui/score-counter";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { toast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/exportToPDF";
import { useState } from "react";
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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(audit);
      toast({
        title: "PDF exported successfully",
        description: "Your audit report has been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 md:p-8 border shadow-lg hover-lift gradient-border overflow-hidden animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
          <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{audit.url}</h2>
            <p className="text-sm text-muted-foreground">
              Audited on {new Date(audit.created_at).toLocaleDateString()} at{" "}
              {new Date(audit.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right animate-bounce-in">
            <div className={`text-5xl md:text-6xl font-extrabold ${getScoreColor(audit.overall_score)}`}>
              <ScoreCounter target={audit.overall_score} duration={1500} />
            </div>
            <Badge variant="secondary" className="mt-2 px-3 py-1 text-sm animate-fade-in">
              {getScoreLabel(audit.overall_score)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hover-lift transition-all duration-300 hover:border-primary/50 rounded-full px-4"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive/50 hover-lift transition-all duration-300 rounded-full px-4"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
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
              className="p-6 border shadow-card hover-lift group cursor-pointer transition-all duration-300"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-primary-subtle group-hover:bg-gradient-primary transition-all duration-300">
                  <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{label}</h3>
                  <p className={`text-2xl font-bold ${getScoreColor(score)} transition-all`}>
                    <ScoreCounter target={score} duration={1000 + index * 100} />
                  </p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-1000 rounded-full" 
                  style={{ width: `${score}%` }} 
                />
              </div>
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
        <Card className="p-6 border shadow-card hover-lift group transition-all duration-300" style={{ animationDelay: '0s' }}>
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              What's Working
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-3">
              {findings.positive.map((item: string, index: number) => (
                <li 
                  key={index} 
                  className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Issues */}
        <Card className="p-6 border shadow-card hover-lift group transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-3">
              {findings.issues.map((item: string, index: number) => (
                <li 
                  key={index} 
                  className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 border shadow-card hover-lift group transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-warning/10">
                <Lightbulb className="h-5 w-5 text-warning" />
              </div>
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-3">
              {findings.recommendations.map((item: string, index: number) => (
                <li 
                  key={index} 
                  className="text-sm text-muted-foreground flex items-start gap-2 opacity-0 animate-fade-in hover:text-foreground transition-colors"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <Lightbulb className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
