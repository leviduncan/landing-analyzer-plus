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

export const exportToPDF = async (audit: AuditData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add text with wrapping
    const addText = (text: string, size: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
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

    // Helper function to get score color
    const getScoreColor = (score: number): number[] => {
      if (score >= 80) return [34, 197, 94]; // green
      if (score >= 60) return [234, 179, 8]; // yellow
      return [239, 68, 68]; // red
    };

    // Header
    addText('Landing Page Audit Report', 20, true, [99, 102, 241]);
    yPos += 5;

    // URL and Date
    addText(`Website: ${audit.url}`, 12, false, [107, 114, 128]);
    addText(`Date: ${new Date(audit.created_at).toLocaleDateString()}`, 12, false, [107, 114, 128]);
    yPos += 10;

    // Overall Score
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    addText('Overall Score', 14, true);
    const scoreColor = getScoreColor(audit.overall_score);
    addText(`${audit.overall_score} / 100`, 24, true, scoreColor);
    
    const scoreLabel = audit.overall_score >= 80 ? 'Excellent' : 
                       audit.overall_score >= 60 ? 'Good' : 
                       audit.overall_score >= 40 ? 'Needs Improvement' : 'Poor';
    addText(scoreLabel, 12, false, scoreColor);
    yPos += 10;

    // Category Scores
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    addText('Category Scores', 14, true);
    yPos += 2;

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
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${cat.label}:`, margin + 5, yPos);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${cat.score}`, margin + 60, yPos);
        yPos += 7;
      }
    });

    yPos += 5;

    // Findings Sections
    const findings = audit.audit_data?.findings || {};

    // What's Working
    if (findings.positive?.length > 0) {
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      addText("What's Working", 14, true, [34, 197, 94]);
      findings.positive.forEach((item: string) => {
        addText(`✓ ${item}`, 10, false);
      });
      yPos += 5;
    }

    // Issues Found
    if (findings.issues?.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      addText('Issues Found', 14, true, [239, 68, 68]);
      findings.issues.forEach((item: string) => {
        addText(`✗ ${item}`, 10, false);
      });
      yPos += 5;
    }

    // Recommendations
    if (findings.recommendations?.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      addText('Recommendations', 14, true, [99, 102, 241]);
      findings.recommendations.forEach((item: string) => {
        addText(`→ ${item}`, 10, false);
      });
    }

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
