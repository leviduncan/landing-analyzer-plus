import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiskBadge } from "./RiskBadge";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Calendar,
  Zap,
  Activity,
  Search,
  Eye,
  MousePointer,
  Smartphone
} from "lucide-react";

interface RiskCategory {
  level: "low" | "moderate" | "high";
  explanation: string;
  signals: string[];
}

interface SnapshotData {
  id: string;
  url: string;
  created_at: string;
  overall_risk: "low" | "moderate" | "high";
  strengths: string[];
  risk_breakdown: {
    performance: RiskCategory;
    core_web_vitals: RiskCategory;
    seo_structure: RiskCategory;
    accessibility: RiskCategory;
    conversion_ux: RiskCategory;
    mobile_readiness: RiskCategory;
  };
  issues: { priority: string; issue: string; category: string }[];
  recommendations: { effort: string; recommendation: string }[];
}

interface FullReportProps {
  data: SnapshotData;
  onExportPdf: () => void;
  isPdfLoading: boolean;
}

export function FullReport({ data, onExportPdf, isPdfLoading }: FullReportProps) {
  const categoryConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    performance: { label: "Performance Risk", icon: <Zap className="h-5 w-5" /> },
    core_web_vitals: { label: "Core Web Vitals Risk", icon: <Activity className="h-5 w-5" /> },
    seo_structure: { label: "SEO & Structure Risk", icon: <Search className="h-5 w-5" /> },
    accessibility: { label: "Accessibility Risk", icon: <Eye className="h-5 w-5" /> },
    conversion_ux: { label: "Conversion & UX Risk", icon: <MousePointer className="h-5 w-5" /> },
    mobile_readiness: { label: "Mobile Readiness Risk", icon: <Smartphone className="h-5 w-5" /> },
  };

  const quickWins = data.recommendations.filter(r => r.effort === "quick");
  const mediumEffort = data.recommendations.filter(r => r.effort === "medium");
  const largerProjects = data.recommendations.filter(r => r.effort === "larger");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Risk Snapshot Report</h1>
          <p className="text-muted-foreground mt-1">{data.url}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date(data.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
        <Button 
          onClick={onExportPdf} 
          disabled={isPdfLoading} 
          variant="outline"
          className="rounded-full px-6 hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4" />
          {isPdfLoading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="border shadow-card gradient-border overflow-hidden">
        <CardHeader className="pt-8">
          <CardTitle className="text-xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="flex items-center gap-4">
            <RiskBadge level={data.overall_risk} size="lg" />
            <p className="text-muted-foreground leading-relaxed">
              {data.overall_risk === "high" && "This page has multiple areas requiring attention that may be affecting performance and conversions."}
              {data.overall_risk === "moderate" && "This page has a solid foundation with some areas that could benefit from optimization."}
              {data.overall_risk === "low" && "This page demonstrates good practices across most areas analyzed."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            This diagnostic reviewed {Object.keys(data.risk_breakdown).length} key areas and identified{" "}
            {data.issues.length} potential issues with {data.recommendations.length} actionable recommendations.
          </p>
        </CardContent>
      </Card>

      {/* What's Working */}
      {data.strengths.length > 0 && (
        <Card className="border shadow-card hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              What's Working
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Risk Breakdown */}
      <Card className="border shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Risk Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(data.risk_breakdown).map(([key, category], idx) => (
            <div key={key}>
              {idx > 0 && <Separator className="mb-6" />}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {categoryConfig[key]?.icon}
                    </div>
                    <h3 className="font-semibold">{categoryConfig[key]?.label}</h3>
                  </div>
                  <RiskBadge level={category.level} size="sm" />
                </div>
                <p className="text-muted-foreground text-sm pl-12">{category.explanation}</p>
                {category.signals.length > 0 && (
                  <div className="pl-12 pt-2">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Signals observed:</p>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      {category.signals.map((signal, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Issues */}
      {data.issues.length > 0 && (
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              Key Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <span className={`
                    px-2.5 py-1 text-xs font-semibold rounded-full shrink-0
                    ${issue.priority === 'high' ? 'bg-destructive/10 text-destructive' : ''}
                    ${issue.priority === 'medium' ? 'bg-warning/10 text-warning' : ''}
                    ${issue.priority === 'low' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {issue.priority.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{issue.issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">{issue.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="border shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">Grouped by implementation effort</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {quickWins.length > 0 && (
              <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Wins
                </h4>
                <ul className="space-y-2.5">
                  {quickWins.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                      {rec.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mediumEffort.length > 0 && (
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                <h4 className="font-semibold text-warning mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Medium Effort
                </h4>
                <ul className="space-y-2.5">
                  {mediumEffort.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
                      {rec.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {largerProjects.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h4 className="font-semibold text-muted-foreground mb-3">Larger Projects</h4>
                <ul className="space-y-2.5">
                  {largerProjects.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {rec.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* What I'd Look At Next */}
      <Card className="border shadow-card bg-muted/30">
        <CardHeader>
          <CardTitle className="text-xl">What I'd Look At Next</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            This snapshot provides a surface-level view based on observable signals. A comprehensive audit would include:
          </p>
          <ul className="grid md:grid-cols-2 gap-3">
            {[
              "Real User Monitoring (RUM) data and Core Web Vitals field metrics",
              "JavaScript bundle analysis and execution profiling",
              "Server response time and TTFB optimization opportunities",
              "Full accessibility audit with assistive technology testing",
              "Conversion funnel analysis and user behavior patterns",
              "Mobile-specific performance testing on real devices",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> This is an automated signals-based diagnostic and does not replace a professional audit.
            Results are based on observable page characteristics at the time of analysis and may not reflect all aspects of your page's performance.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 md:p-12 text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Want a Deeper Analysis?</h3>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Schedule a call to discuss a comprehensive Performance & Core Web Vitals audit
            tailored to your specific goals and technical environment.
          </p>
          <Button 
            asChild 
            size="lg"
            className="rounded-full px-8 py-6 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
          >
            <a href="/contact">
              <Calendar className="mr-2 h-5 w-5" />
              Request a Performance Audit Call
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
