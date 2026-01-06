import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SnapshotHero } from "@/components/risk-snapshot/SnapshotHero";
import { UrlInputForm } from "@/components/risk-snapshot/UrlInputForm";
import { SnapshotSummary } from "@/components/risk-snapshot/SnapshotSummary";
import { EmailGateModal } from "@/components/risk-snapshot/EmailGateModal";
import { FullReport } from "@/components/risk-snapshot/FullReport";
import { AuditCTA } from "@/components/risk-snapshot/AuditCTA";
import { exportRiskSnapshotToPDF } from "@/lib/exportRiskSnapshot";

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

export default function RiskSnapshot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setSnapshotData(null);
    setIsUnlocked(false);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-url", {
        body: { url },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Fetch the full snapshot from database
      const { data: snapshot, error: fetchError } = await supabase
        .from("risk_snapshots")
        .select("*")
        .eq("id", data.id)
        .single();

      if (fetchError) {
        throw new Error("Failed to load results");
      }

      setSnapshotData({
        id: snapshot.id,
        url: snapshot.url,
        created_at: snapshot.created_at,
        overall_risk: snapshot.overall_risk as "low" | "moderate" | "high",
        strengths: (snapshot.strengths as unknown as string[]) || [],
        risk_breakdown: snapshot.risk_breakdown as unknown as SnapshotData["risk_breakdown"],
        issues: (snapshot.issues as unknown as SnapshotData["issues"]) || [],
        recommendations: (snapshot.recommendations as unknown as SnapshotData["recommendations"]) || [],
      });

      toast({
        title: "Analysis Complete",
        description: "Your risk snapshot is ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    if (!snapshotData) return;

    setIsEmailSubmitting(true);

    try {
      const { error } = await supabase
        .from("risk_snapshots")
        .update({ email })
        .eq("id", snapshotData.id);

      if (error) {
        throw new Error("Failed to save email");
      }

      setIsUnlocked(true);
      setShowEmailModal(false);

      toast({
        title: "Report Unlocked",
        description: "You now have access to the full report and PDF export.",
      });
    } catch (error) {
      console.error("Email submission error:", error);
      toast({
        title: "Error",
        description: "Failed to unlock report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!snapshotData) return;

    setIsPdfLoading(true);

    try {
      await exportRiskSnapshotToPDF(snapshotData);
      
      // Mark PDF as generated
      await supabase
        .from("risk_snapshots")
        .update({ pdf_generated: true })
        .eq("id", snapshotData.id);

      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleReset = () => {
    setSnapshotData(null);
    setIsUnlocked(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <SnapshotHero />

        {/* Main Content */}
        <main className="mt-8">
          {!snapshotData ? (
            <UrlInputForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
          ) : isUnlocked ? (
            <>
              <div className="mb-6">
                <button 
                  onClick={handleReset}
                  className="text-sm text-primary hover:underline"
                >
                  ← Analyze another URL
                </button>
              </div>
              <FullReport 
                data={snapshotData} 
                onExportPdf={handleExportPdf}
                isPdfLoading={isPdfLoading}
              />
            </>
          ) : (
            <>
              <SnapshotSummary 
                data={snapshotData} 
                onGetFullReport={() => setShowEmailModal(true)} 
              />
              <AuditCTA />
            </>
          )}
        </main>

        {/* Email Gate Modal */}
        <EmailGateModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          onSubmit={handleEmailSubmit}
          isLoading={isEmailSubmitting}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Frontend Performance & UX Risk Snapshot</p>
          <p className="mt-1">A diagnostic tool for landing page optimization</p>
        </footer>
      </div>
    </div>
  );
}
