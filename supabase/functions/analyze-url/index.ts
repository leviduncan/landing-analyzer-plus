import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RiskCategory {
  level: "low" | "moderate" | "high";
  explanation: string;
  signals: string[];
}

interface AnalysisResult {
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
  issues: { priority: "high" | "medium" | "low"; issue: string; category: string }[];
  recommendations: { effort: "quick" | "medium" | "larger"; recommendation: string }[];
  raw_signals: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing URL: ${parsedUrl.href}`);

    // Fetch HTML content
    let html: string;
    try {
      const response = await fetch(parsedUrl.href, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RiskSnapshotBot/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      html = await response.text();
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Unable to fetch the URL. Please check if the site is accessible." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse signals from HTML
    const signals = parseHtmlSignals(html, parsedUrl.href);
    console.log("Parsed signals:", signals);

    // Calculate risks based on signals
    const analysis = calculateRisks(signals, parsedUrl.href);

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: snapshot, error: insertError } = await supabase
      .from("risk_snapshots")
      .insert({
        url: parsedUrl.href,
        overall_risk: analysis.overall_risk,
        strengths: analysis.strengths,
        risk_breakdown: analysis.risk_breakdown,
        issues: analysis.issues,
        recommendations: analysis.recommendations,
        raw_signals: signals,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      throw new Error("Failed to save analysis");
    }

    return new Response(
      JSON.stringify({ id: snapshot.id, ...analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during analysis";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseHtmlSignals(html: string, url: string): Record<string, unknown> {
  const signals: Record<string, unknown> = {};

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || null;
  signals.hasTitle = !!titleMatch;
  signals.title = title;
  signals.titleLength = title ? title.length : 0;

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = metaDescMatch?.[1]?.trim() || null;
  signals.hasMetaDescription = !!metaDescMatch;
  signals.metaDescription = metaDescription;
  signals.metaDescriptionLength = metaDescription ? metaDescription.length : 0;

  // Viewport meta
  signals.hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);

  // Canonical link
  signals.hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);

  // H1 tags
  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  signals.h1Count = h1Matches.length;
  signals.hasH1 = h1Matches.length > 0;
  signals.multipleH1 = h1Matches.length > 1;

  // Heading structure
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (html.match(/<h4[^>]*>/gi) || []).length;
  signals.headingStructure = { h1: signals.h1Count, h2: h2Count, h3: h3Count, h4: h4Count };
  signals.hasProperHeadingHierarchy = signals.h1Count === 1 && h2Count > 0;

  // Images
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imageCount = imgMatches.length;
  const imagesWithoutAlt = imgMatches.filter(img => {
    const hasAlt = /alt=["'][^"']+["']/i.test(img);
    const hasEmptyAlt = /alt=["']\s*["']/i.test(img);
    return !hasAlt || hasEmptyAlt;
  });
  const imagesMissingAlt = imagesWithoutAlt.length;
  signals.imageCount = imageCount;
  signals.imagesMissingAlt = imagesMissingAlt;
  signals.altTextCoverage = imageCount > 0 
    ? ((imageCount - imagesMissingAlt) / imageCount * 100).toFixed(0)
    : 100;

  // Scripts
  const scriptMatches = html.match(/<script[^>]*>/gi) || [];
  signals.totalScripts = scriptMatches.length;
  const inlineScripts = scriptMatches.filter(s => !s.includes('src='));
  const externalScripts = scriptMatches.filter(s => s.includes('src='));
  signals.inlineScripts = inlineScripts.length;
  signals.externalScripts = externalScripts.length;

  // External script domains
  const externalDomains = new Set<string>();
  externalScripts.forEach(script => {
    const srcMatch = script.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      try {
        const scriptUrl = new URL(srcMatch[1], url);
        if (scriptUrl.hostname !== new URL(url).hostname) {
          externalDomains.add(scriptUrl.hostname);
        }
      } catch {}
    }
  });
  signals.externalScriptDomains = Array.from(externalDomains);
  signals.externalScriptDomainCount = externalDomains.size;

  // Stylesheets
  const stylesheetMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  signals.stylesheetCount = stylesheetMatches.length;

  // Inline styles
  const inlineStyleMatches = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  signals.inlineStyleBlocks = inlineStyleMatches.length;

  // Forms
  const formMatches = html.match(/<form[^>]*>/gi) || [];
  signals.formCount = formMatches.length;
  signals.hasForms = formMatches.length > 0;

  // CTA detection
  const ctaKeywords = /\b(buy|sign\s*up|subscribe|get\s*started|learn\s*more|contact|try|demo|download|register|join|start|book|schedule|request|order|shop|add\s*to\s*cart|checkout)\b/gi;
  const buttonMatches = html.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
  const linkButtonMatches = html.match(/<a[^>]*class[^>]*btn[^>]*>[\s\S]*?<\/a>/gi) || [];
  const allCtas = [...buttonMatches, ...linkButtonMatches];
  const ctasWithKeywords = allCtas.filter(cta => ctaKeywords.test(cta));
  signals.buttonCount = buttonMatches.length;
  signals.ctaCount = ctasWithKeywords.length;
  signals.hasCta = ctasWithKeywords.length > 0;

  // Lazy loading
  signals.hasLazyLoading = /loading=["']lazy["']/i.test(html);

  // Open Graph
  signals.hasOpenGraph = /<meta[^>]*property=["']og:/i.test(html);

  // Structured data
  signals.hasStructuredData = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);

  // ARIA attributes
  const ariaMatches = html.match(/aria-[a-z]+=/gi) || [];
  signals.ariaAttributeCount = ariaMatches.length;
  signals.hasAriaAttributes = ariaMatches.length > 0;

  // HTML size
  signals.htmlSize = html.length;
  signals.htmlSizeKb = (html.length / 1024).toFixed(1);

  return signals;
}

function calculateRisks(signals: Record<string, unknown>, url: string): AnalysisResult {
  const strengths: string[] = [];
  const issues: { priority: "high" | "medium" | "low"; issue: string; category: string }[] = [];
  const recommendations: { effort: "quick" | "medium" | "larger"; recommendation: string }[] = [];

  // Performance Risk
  const performanceSignals: string[] = [];
  let performanceRisk: "low" | "moderate" | "high" = "low";
  
  const totalScripts = signals.totalScripts as number;
  const externalDomainCount = signals.externalScriptDomainCount as number;
  const stylesheetCount = signals.stylesheetCount as number;
  const htmlSizeKb = parseFloat(signals.htmlSizeKb as string);

  if (totalScripts > 25) {
    performanceRisk = "high";
    performanceSignals.push(`${totalScripts} scripts detected`);
    issues.push({ priority: "high", issue: `Page loads ${totalScripts} scripts, which can significantly slow render time`, category: "Performance" });
    recommendations.push({ effort: "larger", recommendation: "Audit and reduce script dependencies. Consider bundling and code-splitting." });
  } else if (totalScripts > 15) {
    performanceRisk = performanceRisk === "low" ? "moderate" : performanceRisk;
    performanceSignals.push(`${totalScripts} scripts loaded`);
    issues.push({ priority: "medium", issue: `${totalScripts} scripts may affect load performance`, category: "Performance" });
  } else {
    performanceSignals.push("Reasonable script count");
    strengths.push("Script count is within acceptable range");
  }

  if (externalDomainCount > 8) {
    performanceRisk = "high";
    performanceSignals.push(`${externalDomainCount} external domains`);
    issues.push({ priority: "high", issue: `Scripts loaded from ${externalDomainCount} external domains adds DNS lookup overhead`, category: "Performance" });
    recommendations.push({ effort: "medium", recommendation: "Reduce third-party dependencies or self-host critical scripts" });
  } else if (externalDomainCount > 4) {
    performanceRisk = performanceRisk === "low" ? "moderate" : performanceRisk;
    performanceSignals.push(`${externalDomainCount} external script domains`);
  }

  if (stylesheetCount > 6) {
    performanceRisk = performanceRisk === "low" ? "moderate" : performanceRisk;
    performanceSignals.push(`${stylesheetCount} stylesheets`);
    issues.push({ priority: "medium", issue: `${stylesheetCount} stylesheet files may cause render-blocking`, category: "Performance" });
    recommendations.push({ effort: "medium", recommendation: "Consider consolidating stylesheets or using critical CSS inlining" });
  }

  if (htmlSizeKb > 200) {
    performanceRisk = performanceRisk === "low" ? "moderate" : performanceRisk;
    performanceSignals.push(`Large HTML document (${htmlSizeKb}KB)`);
    issues.push({ priority: "medium", issue: `HTML document is ${htmlSizeKb}KB - larger pages take longer to parse`, category: "Performance" });
  }

  // Core Web Vitals Risk (based on signals we can detect)
  let cwvRisk: "low" | "moderate" | "high" = "moderate";
  const cwvSignals: string[] = ["Field data requires PageSpeed Insights API"];
  
  if (signals.hasLazyLoading) {
    cwvSignals.push("Lazy loading detected");
    strengths.push("Images use lazy loading for better LCP");
  } else if ((signals.imageCount as number) > 5) {
    cwvSignals.push("No lazy loading detected");
    issues.push({ priority: "medium", issue: "No lazy loading detected for images", category: "Core Web Vitals" });
    recommendations.push({ effort: "quick", recommendation: "Add loading='lazy' to below-the-fold images" });
  }

  if (totalScripts > 20 || externalDomainCount > 6) {
    cwvRisk = "high";
    cwvSignals.push("Heavy script load may affect INP");
  }

  // SEO & Structure Risk
  let seoRisk: "low" | "moderate" | "high" = "low";
  const seoSignals: string[] = [];

  if (!signals.hasH1) {
    seoRisk = "high";
    seoSignals.push("No H1 heading found");
    issues.push({ priority: "high", issue: "No H1 heading detected - critical for SEO and accessibility", category: "SEO & Structure" });
    recommendations.push({ effort: "quick", recommendation: "Add a single, descriptive H1 heading to the page" });
  } else if (signals.multipleH1) {
    seoRisk = "moderate";
    seoSignals.push(`Multiple H1 headings (${signals.h1Count})`);
    issues.push({ priority: "medium", issue: `${signals.h1Count} H1 headings detected - should have exactly one`, category: "SEO & Structure" });
    recommendations.push({ effort: "quick", recommendation: "Reduce to a single H1 and use H2-H6 for subheadings" });
  } else {
    seoSignals.push("Single H1 heading present");
    strengths.push("Page has a proper single H1 heading");
  }

  if (!signals.hasTitle) {
    seoRisk = "high";
    seoSignals.push("No title tag");
    issues.push({ priority: "high", issue: "Missing title tag", category: "SEO & Structure" });
    recommendations.push({ effort: "quick", recommendation: "Add a descriptive title tag (50-60 characters)" });
  } else if ((signals.titleLength as number) < 30 || (signals.titleLength as number) > 70) {
    seoRisk = seoRisk === "low" ? "moderate" : seoRisk;
    seoSignals.push(`Title length: ${signals.titleLength} chars`);
    issues.push({ priority: "low", issue: `Title is ${signals.titleLength} characters (optimal: 50-60)`, category: "SEO & Structure" });
  } else {
    seoSignals.push("Title tag present and well-sized");
    strengths.push("Title tag is present with good length");
  }

  if (!signals.hasMetaDescription) {
    seoRisk = seoRisk === "low" ? "moderate" : seoRisk;
    seoSignals.push("No meta description");
    issues.push({ priority: "medium", issue: "Missing meta description", category: "SEO & Structure" });
    recommendations.push({ effort: "quick", recommendation: "Add a compelling meta description (120-160 characters)" });
  } else {
    strengths.push("Meta description is present");
  }

  if (!signals.hasCanonical) {
    seoSignals.push("No canonical link");
    issues.push({ priority: "low", issue: "No canonical link tag detected", category: "SEO & Structure" });
    recommendations.push({ effort: "quick", recommendation: "Add a canonical link to prevent duplicate content issues" });
  } else {
    strengths.push("Canonical link is properly set");
  }

  if (signals.hasStructuredData) {
    strengths.push("Structured data (JSON-LD) is present");
  }

  if (signals.hasOpenGraph) {
    strengths.push("Open Graph tags present for social sharing");
  }

  // Accessibility Risk
  let accessibilityRisk: "low" | "moderate" | "high" = "low";
  const accessibilitySignals: string[] = [];

  const imagesMissingAlt = signals.imagesMissingAlt as number;
  const imageCount = signals.imageCount as number;

  if (imagesMissingAlt > 10) {
    accessibilityRisk = "high";
    accessibilitySignals.push(`${imagesMissingAlt} images missing alt text`);
    issues.push({ priority: "high", issue: `${imagesMissingAlt} of ${imageCount} images lack alt text`, category: "Accessibility" });
    recommendations.push({ effort: "medium", recommendation: "Add descriptive alt text to all meaningful images" });
  } else if (imagesMissingAlt > 3) {
    accessibilityRisk = "moderate";
    accessibilitySignals.push(`${imagesMissingAlt} images missing alt text`);
    issues.push({ priority: "medium", issue: `${imagesMissingAlt} images missing alt text`, category: "Accessibility" });
    recommendations.push({ effort: "quick", recommendation: "Review and add alt text to remaining images" });
  } else if (imageCount > 0) {
    accessibilitySignals.push(`${signals.altTextCoverage}% alt text coverage`);
    if (imagesMissingAlt === 0) {
      strengths.push("All images have alt text");
    }
  }

  if (!signals.hasAriaAttributes && (signals.buttonCount as number) > 3) {
    accessibilityRisk = accessibilityRisk === "low" ? "moderate" : accessibilityRisk;
    accessibilitySignals.push("No ARIA attributes detected");
    issues.push({ priority: "low", issue: "No ARIA attributes found for enhanced accessibility", category: "Accessibility" });
  } else if (signals.hasAriaAttributes) {
    accessibilitySignals.push("ARIA attributes in use");
    strengths.push("Page uses ARIA attributes for accessibility");
  }

  if (!signals.hasProperHeadingHierarchy) {
    accessibilityRisk = accessibilityRisk === "low" ? "moderate" : accessibilityRisk;
    accessibilitySignals.push("Heading hierarchy may be incomplete");
  }

  // Conversion & UX Risk
  let conversionRisk: "low" | "moderate" | "high" = "low";
  const conversionSignals: string[] = [];

  if (!signals.hasCta) {
    conversionRisk = "high";
    conversionSignals.push("No clear CTA detected");
    issues.push({ priority: "high", issue: "No clear call-to-action detected", category: "Conversion & UX" });
    recommendations.push({ effort: "medium", recommendation: "Add prominent, action-oriented buttons with clear value proposition" });
  } else {
    conversionSignals.push(`${signals.ctaCount} CTAs detected`);
    strengths.push("Clear call-to-action elements present");
  }

  if (!signals.hasForms && !signals.hasCta) {
    conversionRisk = "high";
    conversionSignals.push("No conversion mechanisms");
    issues.push({ priority: "high", issue: "No forms or conversion elements detected", category: "Conversion & UX" });
  } else if (signals.hasForms) {
    conversionSignals.push(`${signals.formCount} form(s) present`);
    strengths.push("Lead capture form is present");
  }

  // Mobile Readiness Risk
  let mobileRisk: "low" | "moderate" | "high" = "low";
  const mobileSignals: string[] = [];

  if (!signals.hasViewport) {
    mobileRisk = "high";
    mobileSignals.push("No viewport meta tag");
    issues.push({ priority: "high", issue: "Missing viewport meta tag - page won't render correctly on mobile", category: "Mobile Readiness" });
    recommendations.push({ effort: "quick", recommendation: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>" });
  } else {
    mobileSignals.push("Viewport meta configured");
    strengths.push("Viewport meta tag is properly configured");
  }

  if (!signals.hasLazyLoading && imageCount > 3) {
    mobileRisk = mobileRisk === "low" ? "moderate" : mobileRisk;
    mobileSignals.push("No lazy loading for images");
  }

  // Calculate overall risk
  const riskLevels = [performanceRisk, cwvRisk, seoRisk, accessibilityRisk, conversionRisk, mobileRisk];
  const highCount = riskLevels.filter(r => r === "high").length;
  const moderateCount = riskLevels.filter(r => r === "moderate").length;

  let overallRisk: "low" | "moderate" | "high";
  if (highCount >= 2) {
    overallRisk = "high";
  } else if (highCount >= 1 || moderateCount >= 3) {
    overallRisk = "moderate";
  } else {
    overallRisk = "low";
  }

  return {
    url,
    overall_risk: overallRisk,
    strengths: strengths.slice(0, 6),
    risk_breakdown: {
      performance: { level: performanceRisk, explanation: getPerformanceExplanation(performanceRisk, performanceSignals), signals: performanceSignals },
      core_web_vitals: { level: cwvRisk, explanation: getCwvExplanation(cwvRisk, cwvSignals), signals: cwvSignals },
      seo_structure: { level: seoRisk, explanation: getSeoExplanation(seoRisk, seoSignals), signals: seoSignals },
      accessibility: { level: accessibilityRisk, explanation: getAccessibilityExplanation(accessibilityRisk, accessibilitySignals), signals: accessibilitySignals },
      conversion_ux: { level: conversionRisk, explanation: getConversionExplanation(conversionRisk, conversionSignals), signals: conversionSignals },
      mobile_readiness: { level: mobileRisk, explanation: getMobileExplanation(mobileRisk, mobileSignals), signals: mobileSignals },
    },
    issues: issues.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    }).slice(0, 10),
    recommendations: recommendations.slice(0, 8),
    raw_signals: signals,
  };
}

function getPerformanceExplanation(level: string, signals: string[]): string {
  if (level === "high") return "Multiple performance concerns detected that likely cause noticeable loading delays for visitors.";
  if (level === "moderate") return "Some performance factors may slow page loading, particularly on slower connections.";
  return "Page appears reasonably optimized for loading performance based on observable signals.";
}

function getCwvExplanation(level: string, signals: string[]): string {
  if (level === "high") return "Signals suggest Core Web Vitals may need attention. Heavy scripting often correlates with poor interactivity scores.";
  if (level === "moderate") return "Some factors may affect Core Web Vitals. Real field data from PageSpeed Insights would provide definitive metrics.";
  return "No major concerns detected for Core Web Vitals based on available signals.";
}

function getSeoExplanation(level: string, signals: string[]): string {
  if (level === "high") return "Critical SEO elements are missing that affect how search engines understand and rank this page.";
  if (level === "moderate") return "Basic SEO is present but some improvements would help search visibility.";
  return "Core SEO fundamentals are in place.";
}

function getAccessibilityExplanation(level: string, signals: string[]): string {
  if (level === "high") return "Significant accessibility gaps detected that may prevent some users from accessing content.";
  if (level === "moderate") return "Some accessibility improvements needed to ensure the page works well for all users.";
  return "Basic accessibility markers are present.";
}

function getConversionExplanation(level: string, signals: string[]): string {
  if (level === "high") return "No clear conversion path detected. Visitors may not know what action to take.";
  if (level === "moderate") return "Conversion elements exist but could be strengthened.";
  return "Clear calls-to-action are present on the page.";
}

function getMobileExplanation(level: string, signals: string[]): string {
  if (level === "high") return "Critical mobile configuration is missing. The page may not display correctly on mobile devices.";
  if (level === "moderate") return "Basic mobile support is present but some optimizations are missing.";
  return "Page appears configured for mobile devices.";
}
