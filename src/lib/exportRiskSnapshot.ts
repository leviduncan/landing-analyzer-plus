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

// Color palette matching the UI design system
const colors = {
  primary: [139, 92, 246] as [number, number, number],      // Purple
  accent: [236, 72, 153] as [number, number, number],       // Pink
  success: [34, 197, 94] as [number, number, number],       // Green
  warning: [202, 138, 4] as [number, number, number],       // Amber
  destructive: [220, 53, 69] as [number, number, number],   // Red
  textDark: [30, 41, 59] as [number, number, number],       // Slate 800
  textMuted: [100, 116, 139] as [number, number, number],   // Slate 500
  textLight: [148, 163, 184] as [number, number, number],   // Slate 400
  border: [226, 232, 240] as [number, number, number],      // Slate 200
  white: [255, 255, 255] as [number, number, number],
  cardBg: [250, 250, 252] as [number, number, number],
};

export async function exportRiskSnapshotToPDF(data: SnapshotData): Promise<boolean> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
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
      case "low": return colors.success;
      case "moderate": return colors.warning;
      case "high": return colors.destructive;
      default: return colors.textMuted;
    }
  };

  // Helper to draw section header with purple accent
  const drawSectionHeader = (title: string, color: [number, number, number] = colors.primary) => {
    // Left border accent
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos - 5, 3, 8, "F");
    
    // Title text
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 8, yPos);
    yPos += 10;
  };

  const categoryLabels: Record<string, string> = {
    performance: "Performance Risk",
    core_web_vitals: "Core Web Vitals Risk",
    seo_structure: "SEO & Structure Risk",
    accessibility: "Accessibility Risk",
    conversion_ux: "Conversion & UX Risk",
    mobile_readiness: "Mobile Readiness Risk",
  };

  // ============ GRADIENT HEADER ============
  // Main purple header bar
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Add subtle pink accent on right side (simulated gradient)
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(pageWidth - 60, 0, 60, 45, "F");
  
  // Blend zone
  const blendColor: [number, number, number] = [188, 82, 200]; // Mix of purple and pink
  doc.setFillColor(blendColor[0], blendColor[1], blendColor[2]);
  doc.rect(pageWidth - 90, 0, 30, 45, "F");

  // Header text
  yPos = 18;
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Frontend Performance & UX", margin, yPos);
  
  yPos += 8;
  doc.setFontSize(18);
  doc.text("Risk Snapshot", margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Risk Assessment Report", margin, yPos);
  
  yPos = 60;

  // ============ URL AND DATE ============
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ANALYZED URL", margin, yPos);
  
  yPos += 5;
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const urlLines = doc.splitTextToSize(data.url, contentWidth);
  doc.text(urlLines, margin, yPos);
  yPos += urlLines.length * 5 + 3;
  
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(9);
  const dateStr = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${dateStr}`, margin, yPos);
  
  yPos += 15;

  // ============ OVERALL RISK CARD ============
  // Card background
  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "FD");
  
  // Purple top border accent
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, yPos, contentWidth, 3, "F");
  
  yPos += 12;
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("OVERALL RISK LEVEL", margin + 10, yPos);
  
  // Risk level badge
  const [r, g, b] = getRiskColor(data.overall_risk);
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin + 10, yPos + 3, 35, 10, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const riskText = data.overall_risk.toUpperCase() + " RISK";
  doc.text(riskText, margin + 27.5 - doc.getTextWidth(riskText) / 2 + 10, yPos + 10);
  
  yPos += 25;

  // ============ STRENGTHS ============
  if (data.strengths.length > 0) {
    yPos += 10;
    checkNewPage(40);
    drawSectionHeader("What's Working", colors.success);
    
    data.strengths.forEach(strength => {
      checkNewPage(10);
      doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
      doc.setFontSize(10);
      doc.text("✓", margin + 5, yPos);
      doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(strength, contentWidth - 15);
      doc.text(lines, margin + 12, yPos);
      yPos += lines.length * 5 + 3;
    });
    yPos += 5;
  }

  // ============ RISK BREAKDOWN ============
  yPos += 5;
  checkNewPage(30);
  drawSectionHeader("Risk Breakdown by Category");
  yPos += 5;

  Object.entries(data.risk_breakdown).forEach(([key, category]) => {
    checkNewPage(25);
    
    // Risk level badge
    const [r, g, b] = getRiskColor(category.level);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, yPos - 4, 22, 7, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const levelText = category.level.toUpperCase();
    doc.text(levelText, margin + 11 - doc.getTextWidth(levelText) / 2, yPos + 1);
    
    // Category label
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(categoryLabels[key] || key, margin + 28, yPos + 1);
    yPos += 8;

    // Explanation
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const explLines = doc.splitTextToSize(category.explanation, contentWidth - 10);
    doc.text(explLines, margin + 5, yPos);
    yPos += explLines.length * 4 + 8;
  });

  // ============ ISSUES ============
  if (data.issues.length > 0) {
    checkNewPage(30);
    yPos += 5;
    drawSectionHeader("Key Issues Found", colors.destructive);
    yPos += 3;

    const priorityColors: Record<string, [number, number, number]> = {
      high: colors.destructive,
      medium: colors.warning,
      low: colors.textMuted,
    };

    data.issues.forEach(issue => {
      checkNewPage(15);
      
      // Priority badge
      const [r, g, b] = priorityColors[issue.priority] || colors.textMuted;
      doc.setFillColor(r, g, b);
      doc.roundedRect(margin, yPos - 4, 18, 6, 2, 2, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const prioText = issue.priority.toUpperCase();
      doc.text(prioText, margin + 9 - doc.getTextWidth(prioText) / 2, yPos);
      
      // Issue text
      doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const issueLines = doc.splitTextToSize(issue.issue, contentWidth - 25);
      doc.text(issueLines, margin + 22, yPos);
      yPos += issueLines.length * 4 + 6;
    });
  }

  // ============ RECOMMENDATIONS ============
  if (data.recommendations.length > 0) {
    checkNewPage(30);
    yPos += 10;
    drawSectionHeader("Recommendations", colors.primary);
    yPos += 3;

    const effortLabels: Record<string, string> = {
      quick: "Quick Win",
      medium: "Medium",
      larger: "Larger",
    };

    const effortColors: Record<string, [number, number, number]> = {
      quick: colors.success,
      medium: colors.warning,
      larger: colors.primary,
    };

    data.recommendations.forEach(rec => {
      checkNewPage(15);
      
      // Effort badge
      const [r, g, b] = effortColors[rec.effort] || colors.primary;
      doc.setFillColor(r, g, b);
      const effortLabel = effortLabels[rec.effort] || rec.effort;
      const badgeWidth = Math.max(doc.getTextWidth(effortLabel) * 0.4 + 6, 20);
      doc.roundedRect(margin, yPos - 4, badgeWidth, 6, 2, 2, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(effortLabel, margin + badgeWidth / 2 - doc.getTextWidth(effortLabel) / 2, yPos);
      
      // Recommendation text with arrow
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(9);
      doc.text("→", margin + badgeWidth + 4, yPos);
      
      doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
      doc.setFont("helvetica", "normal");
      const recLines = doc.splitTextToSize(rec.recommendation, contentWidth - badgeWidth - 15);
      doc.text(recLines, margin + badgeWidth + 10, yPos);
      yPos += recLines.length * 4 + 6;
    });
  }

  // ============ FOOTER DISCLAIMER ============
  checkNewPage(30);
  yPos += 15;
  
  // Purple accent line
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, yPos, 40, 1, "F");
  yPos += 8;

  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
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
