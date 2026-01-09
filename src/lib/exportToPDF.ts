import jsPDF from 'jspdf';

interface AuditData {
  url: string;
  created_at: string;
  overall_score: number;
  seo_score?: number;
  performance_score?: number;
  accessibility_score?: number;
  conversion_score?: number;
  mobile_score?: number;
  ux_score?: number;
  audit_data?: any;
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
};

export const exportToPDF = async (audit: AuditData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to get score color
    const getScoreColor = (score: number): [number, number, number] => {
      if (score >= 80) return colors.success;
      if (score >= 60) return colors.warning;
      return colors.destructive;
    };

    // Helper to check for new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with wrapping
    const addText = (text: string, size: number, isBold: boolean = false, color: [number, number, number] = colors.textDark) => {
      pdf.setFontSize(size);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin, yPos);
        yPos += size * 0.5;
      });
      yPos += 3;
    };

    // Helper to draw section header with purple accent
    const drawSectionHeader = (title: string, color: [number, number, number] = colors.primary) => {
      // Purple left border accent
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(margin, yPos - 5, 3, 8, 'F');
      
      // Title text
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 8, yPos);
      yPos += 10;
    };

    // ============ GRADIENT HEADER ============
    // Main purple header bar
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Add subtle pink accent on right side (simulated gradient)
    pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.rect(pageWidth - 60, 0, 60, 40, 'F');
    
    // Blend zone
    const blendColor: [number, number, number] = [188, 82, 200]; // Mix of purple and pink
    pdf.setFillColor(blendColor[0], blendColor[1], blendColor[2]);
    pdf.rect(pageWidth - 90, 0, 30, 40, 'F');

    // Header text
    yPos = 18;
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Landing Page Audit Report', margin, yPos);
    
    yPos += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Comprehensive Website Analysis', margin, yPos);
    
    yPos = 55;

    // ============ URL AND DATE ============
    pdf.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('WEBSITE', margin, yPos);
    yPos += 5;
    pdf.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    pdf.setFont('helvetica', 'normal');
    const urlLines = pdf.splitTextToSize(audit.url, pageWidth - 2 * margin);
    pdf.text(urlLines, margin, yPos);
    yPos += urlLines.length * 5 + 3;
    
    pdf.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date(audit.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    yPos += 15;

    // ============ OVERALL SCORE CARD ============
    // Card background
    pdf.setFillColor(250, 250, 252);
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'FD');
    
    // Purple top border accent
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 3, 'F');
    
    yPos += 12;
    pdf.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OVERALL SCORE', margin + 10, yPos);
    
    // Score value
    const scoreColor = getScoreColor(audit.overall_score);
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${audit.overall_score}`, margin + 10, yPos + 15);
    
    pdf.setFontSize(14);
    pdf.text('/ 100', margin + 35, yPos + 15);
    
    // Score label
    const scoreLabel = audit.overall_score >= 80 ? 'Excellent' : 
                       audit.overall_score >= 60 ? 'Good' : 
                       audit.overall_score >= 40 ? 'Needs Improvement' : 'Poor';
    pdf.setFontSize(11);
    pdf.text(scoreLabel, pageWidth - margin - pdf.getTextWidth(scoreLabel) - 10, yPos + 10);
    
    yPos += 35;

    // ============ CATEGORY SCORES ============
    yPos += 10;
    drawSectionHeader('Category Scores');
    yPos += 5;

    const categories = [
      { label: 'SEO', score: audit.seo_score },
      { label: 'Performance', score: audit.performance_score },
      { label: 'Accessibility', score: audit.accessibility_score },
      { label: 'Conversion', score: audit.conversion_score },
      { label: 'Mobile', score: audit.mobile_score },
      { label: 'UX/UI', score: audit.ux_score },
    ];

    categories.forEach(cat => {
      if (cat.score !== undefined && cat.score !== null) {
        const color = getScoreColor(cat.score);
        
        // Score badge background
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(margin, yPos - 4, 25, 7, 2, 2, 'F');
        
        // Score text in badge
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const scoreText = `${cat.score}`;
        pdf.text(scoreText, margin + 12.5 - pdf.getTextWidth(scoreText) / 2, yPos + 1);
        
        // Category label
        pdf.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(cat.label, margin + 32, yPos + 1);
        
        yPos += 10;
      }
    });

    yPos += 10;

    // ============ FINDINGS SECTIONS ============
    const findings = audit.audit_data?.findings || {};

    // What's Working
    if (findings.positive?.length > 0) {
      checkNewPage(40);
      drawSectionHeader("What's Working", colors.success);
      
      findings.positive.forEach((item: string) => {
        checkNewPage(10);
        pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
        pdf.setFontSize(10);
        pdf.text('✓', margin + 5, yPos);
        pdf.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        const lines = pdf.splitTextToSize(item, pageWidth - 2 * margin - 15);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 8;
    }

    // Issues Found
    if (findings.issues?.length > 0) {
      checkNewPage(40);
      drawSectionHeader('Issues Found', colors.destructive);
      
      findings.issues.forEach((item: string) => {
        checkNewPage(10);
        pdf.setTextColor(colors.destructive[0], colors.destructive[1], colors.destructive[2]);
        pdf.setFontSize(10);
        pdf.text('✗', margin + 5, yPos);
        pdf.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        const lines = pdf.splitTextToSize(item, pageWidth - 2 * margin - 15);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 5 + 3;
      });
      yPos += 8;
    }

    // Recommendations
    if (findings.recommendations?.length > 0) {
      checkNewPage(40);
      drawSectionHeader('Recommendations', colors.primary);
      
      findings.recommendations.forEach((item: string) => {
        checkNewPage(10);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.setFontSize(10);
        pdf.text('→', margin + 5, yPos);
        pdf.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
        const lines = pdf.splitTextToSize(item, pageWidth - 2 * margin - 15);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    // ============ FOOTER DISCLAIMER ============
    checkNewPage(30);
    yPos += 15;
    
    // Purple accent line
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.rect(margin, yPos, 40, 1, 'F');
    yPos += 8;
    
    pdf.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const disclaimer = 'This report was generated automatically and provides a snapshot of your landing page performance. For a comprehensive analysis, consider a professional audit.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    pdf.text(disclaimerLines, margin, yPos);

    // Save the PDF
    const domain = new URL(audit.url).hostname.replace('www.', '');
    const date = new Date(audit.created_at).toISOString().split('T')[0];
    const filename = `audit-${domain}-${date}.pdf`;
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
