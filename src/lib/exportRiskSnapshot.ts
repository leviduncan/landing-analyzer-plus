import jsPDF from "jspdf";

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

export async function exportRiskSnapshotToPDF(data: SnapshotData): Promise<boolean> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, x: number, fontSize: number, fontStyle: string = "normal", maxWidth?: number) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, yPos);
      return lines.length * (fontSize * 0.4);
    } else {
      doc.text(text, x, yPos);
      return fontSize * 0.4;
    }
  };

  const getRiskColor = (level: string): [number, number, number] => {
    switch (level) {
      case "low": return [34, 139, 34]; // Green
      case "moderate": return [218, 165, 32]; // Goldenrod
      case "high": return [220, 53, 69]; // Red
      default: return [100, 100, 100];
    }
  };

  const categoryLabels: Record<string, string> = {
    performance: "Performance Risk",
    core_web_vitals: "Core Web Vitals Risk",
    seo_structure: "SEO & Structure Risk",
    accessibility: "Accessibility Risk",
    conversion_ux: "Conversion & UX Risk",
    mobile_readiness: "Mobile Readiness Risk",
  };

  // Header
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  yPos = 15;
  doc.setTextColor(33, 33, 33);
  addText("Frontend Performance & UX Risk Snapshot", margin, 16, "bold");
  
  yPos += 10;
  doc.setTextColor(100, 100, 100);
  addText("Risk Assessment Report", margin, 10);
  
  yPos += 20;

  // URL and Date
  doc.setTextColor(33, 33, 33);
  addText("URL:", margin, 10, "bold");
  doc.setTextColor(66, 66, 66);
  yPos += 5;
  addText(data.url, margin, 10, "normal", contentWidth);
  
  yPos += 8;
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  addText(`Generated: ${dateStr}`, margin, 9);
  
  yPos += 15;

  // Overall Risk
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setTextColor(33, 33, 33);
  addText("Overall Risk Level", margin, 12, "bold");
  yPos += 8;

  const [r, g, b] = getRiskColor(data.overall_risk);
  doc.setTextColor(r, g, b);
  addText(data.overall_risk.toUpperCase() + " RISK", margin, 14, "bold");
  yPos += 15;

  // Strengths
  if (data.strengths.length > 0) {
    checkNewPage(40);
    doc.setTextColor(33, 33, 33);
    addText("What's Working", margin, 12, "bold");
    yPos += 8;

    doc.setTextColor(66, 66, 66);
    data.strengths.forEach(strength => {
      checkNewPage(10);
      addText(`✓ ${strength}`, margin + 5, 10, "normal", contentWidth - 10);
      yPos += 7;
    });
    yPos += 10;
  }

  // Risk Breakdown
  checkNewPage(30);
  doc.setTextColor(33, 33, 33);
  addText("Risk Breakdown by Category", margin, 12, "bold");
  yPos += 10;

  Object.entries(data.risk_breakdown).forEach(([key, category]) => {
    checkNewPage(30);
    
    const [r, g, b] = getRiskColor(category.level);
    doc.setTextColor(r, g, b);
    addText(`[${category.level.toUpperCase()}]`, margin, 10, "bold");
    
    doc.setTextColor(33, 33, 33);
    doc.text(categoryLabels[key] || key, margin + 30, yPos);
    yPos += 6;

    doc.setTextColor(100, 100, 100);
    const lineHeight = addText(category.explanation, margin + 5, 9, "normal", contentWidth - 10);
    yPos += lineHeight + 8;
  });

  // Issues
  if (data.issues.length > 0) {
    checkNewPage(30);
    yPos += 5;
    doc.setTextColor(33, 33, 33);
    addText("Key Issues Found", margin, 12, "bold");
    yPos += 10;

    data.issues.forEach(issue => {
      checkNewPage(15);
      
      const priorityColors: Record<string, [number, number, number]> = {
        high: [220, 53, 69],
        medium: [218, 165, 32],
        low: [100, 100, 100],
      };
      
      const [r, g, b] = priorityColors[issue.priority] || [100, 100, 100];
      doc.setTextColor(r, g, b);
      addText(`[${issue.priority.toUpperCase()}]`, margin, 9, "bold");
      
      doc.setTextColor(66, 66, 66);
      const lineHeight = addText(issue.issue, margin + 25, 9, "normal", contentWidth - 30);
      yPos += lineHeight + 5;
    });
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    checkNewPage(30);
    yPos += 10;
    doc.setTextColor(33, 33, 33);
    addText("Recommendations", margin, 12, "bold");
    yPos += 10;

    const effortLabels: Record<string, string> = {
      quick: "Quick Win",
      medium: "Medium Effort",
      larger: "Larger Project",
    };

    data.recommendations.forEach(rec => {
      checkNewPage(15);
      
      doc.setTextColor(100, 100, 100);
      addText(`[${effortLabels[rec.effort] || rec.effort}]`, margin, 9);
      yPos += 5;
      
      doc.setTextColor(66, 66, 66);
      const lineHeight = addText(`→ ${rec.recommendation}`, margin + 5, 9, "normal", contentWidth - 10);
      yPos += lineHeight + 5;
    });
  }

  // Disclaimer
  checkNewPage(30);
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  const disclaimer = "Disclaimer: This is an automated signals-based diagnostic and does not replace a professional audit. Results are based on observable page characteristics at the time of analysis.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, yPos);

  // Generate filename
  const domain = new URL(data.url).hostname.replace(/^www\./, "");
  const dateForFile = new Date(data.created_at).toISOString().split("T")[0];
  const filename = `risk-snapshot-${domain}-${dateForFile}.pdf`;

  doc.save(filename);
  return true;
}
