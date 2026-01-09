import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./RiskBadge";
import { CheckCircle, AlertTriangle, FileText } from "lucide-react";

interface RiskCategory {
  level: "low" | "moderate" | "high";
  explanation: string;
  signals: string[];
}

interface SnapshotData {
  id: string;
  url: string;
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
}

interface SnapshotSummaryProps {
  data: SnapshotData;
  onGetFullReport: () => void;
}

export function SnapshotSummary({ data, onGetFullReport }: SnapshotSummaryProps) {
  // Get top 3 highest risk categories
  const riskEntries = Object.entries(data.risk_breakdown) as [string, RiskCategory][];
  const topRisks = riskEntries
    .filter(([, cat]) => cat.level !== "low")
    .sort((a, b) => {
      const order = { high: 0, moderate: 1, low: 2 };
      return order[a[1].level] - order[b[1].level];
    })
    .slice(0, 3);

  const categoryLabels: Record<string, string> = {
    performance: "Performance",
    core_web_vitals: "Core Web Vitals",
    seo_structure: "SEO & Structure",
    accessibility: "Accessibility",
    conversion_ux: "Conversion & UX",
    mobile_readiness: "Mobile Readiness",
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-slide-up">
      {/* Overall Risk */}
      <Card className="border shadow-card hover-lift gradient-border overflow-hidden">
        <CardHeader className="text-center pb-3 pt-8">
          <p className="text-sm text-muted-foreground mb-3">
            Analysis for <span className="font-semibold text-foreground">{data.url}</span>
          </p>
          <CardTitle className="text-2xl font-bold">Overall Risk Level</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <RiskBadge level={data.overall_risk} size="lg" className="mb-5" />
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {data.overall_risk === "high" && "Multiple areas need attention to improve user experience and performance."}
            {data.overall_risk === "moderate" && "Some improvement opportunities exist that could enhance performance."}
            {data.overall_risk === "low" && "Fundamentals look solid. Minor optimizations may still be beneficial."}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Risks */}
        {topRisks.length > 0 && (
          <Card className="border shadow-card hover-lift">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                Key Risk Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topRisks.map(([key, category]) => (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <RiskBadge level={category.level} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{categoryLabels[key]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{category.signals[0]}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Strengths */}
        {data.strengths.length > 0 && (
          <Card className="border shadow-card hover-lift">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                What's Working
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.strengths.slice(0, 4).map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{strength}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        This is a signals-based snapshot, not a comprehensive audit. Results are based on observable page characteristics.
      </p>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button 
          size="lg" 
          onClick={onGetFullReport} 
          className="px-10 py-6 text-base rounded-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
        >
          <FileText className="mr-2 h-5 w-5" />
          Get Full Report + PDF
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Unlock detailed findings, recommendations, and downloadable report
        </p>
      </div>
    </div>
  );
}
