import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();
    console.log('Auditing website:', url);

    if (!url || !userId) {
      return new Response(
        JSON.stringify({ error: 'URL and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch website content with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let htmlContent = '';
    let fetchError = null;
    const startTime = Date.now();
    
    try {
      const response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LandingPageAuditor/1.0'
        }
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      htmlContent = await response.text();
    } catch (error) {
      clearTimeout(timeout);
      fetchError = error instanceof Error ? error.message : 'Failed to fetch website';
      console.error('Error fetching website:', error);
    }

    const loadTime = Date.now() - startTime;

    // Parse HTML and extract data
    const auditData: any = {
      meta: {},
      headings: [],
      images: { total: 0, withAlt: 0, lazy: 0 },
      links: { internal: 0, external: 0 },
      forms: 0,
      ctas: 0,
      scripts: 0,
      stylesheets: 0,
      hasViewport: false,
      loadTime,
      fetchError
    };

    if (htmlContent) {
      // Extract meta tags
      const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
      auditData.meta.title = titleMatch ? titleMatch[1].trim() : null;

      const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      auditData.meta.description = descMatch ? descMatch[1] : null;

      const ogTitleMatch = htmlContent.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
      auditData.meta.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;

      const ogDescMatch = htmlContent.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
      auditData.meta.ogDescription = ogDescMatch ? ogDescMatch[1] : null;

      // Check viewport
      auditData.hasViewport = /<meta\s+name=["']viewport["']/i.test(htmlContent);

      // Count headings
      const h1Count = (htmlContent.match(/<h1[^>]*>/gi) || []).length;
      const h2Count = (htmlContent.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (htmlContent.match(/<h3[^>]*>/gi) || []).length;
      auditData.headings = { h1: h1Count, h2: h2Count, h3: h3Count };

      // Analyze images
      const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
      auditData.images.total = imgTags.length;
      auditData.images.withAlt = imgTags.filter(img => /alt=["'][^"']*["']/i.test(img)).length;
      auditData.images.lazy = imgTags.filter(img => /loading=["']lazy["']/i.test(img)).length;

      // Count links
      const linkTags = htmlContent.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [];
      linkTags.forEach(link => {
        if (link.includes('http') && !link.includes(new URL(normalizedUrl).hostname)) {
          auditData.links.external++;
        } else {
          auditData.links.internal++;
        }
      });

      // Count forms and CTAs
      auditData.forms = (htmlContent.match(/<form[^>]*>/gi) || []).length;
      auditData.ctas = (htmlContent.match(/button|btn|cta|signup|register|subscribe|buy|download|start/gi) || []).length;

      // Count resources
      auditData.scripts = (htmlContent.match(/<script[^>]*>/gi) || []).length;
      auditData.stylesheets = (htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;
    }

    // Calculate scores using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const aiPrompt = `You are a website auditing expert. Analyze this landing page data and provide scores (0-100) and recommendations.

Website: ${normalizedUrl}
Load Time: ${loadTime}ms
Fetch Error: ${fetchError || 'None'}

Data:
- Title: ${auditData.meta.title || 'Missing'}
- Description: ${auditData.meta.description || 'Missing'}
- OG Tags: ${auditData.meta.ogTitle ? 'Present' : 'Missing'}
- H1 Count: ${auditData.headings.h1}
- Images: ${auditData.images.total} (${auditData.images.withAlt} with alt text, ${auditData.images.lazy} lazy loaded)
- Links: ${auditData.links.internal} internal, ${auditData.links.external} external
- Forms: ${auditData.forms}
- CTAs: ${auditData.ctas}
- Viewport: ${auditData.hasViewport ? 'Yes' : 'No'}

Provide a JSON response with:
{
  "seo_score": <0-100>,
  "performance_score": <0-100>,
  "accessibility_score": <0-100>,
  "conversion_score": <0-100>,
  "mobile_score": <0-100>,
  "ux_score": <0-100>,
  "findings": {
    "positive": ["item1", "item2"],
    "issues": ["issue1", "issue2"],
    "recommendations": ["rec1", "rec2"]
  }
}`;

    let aiResponse: any = {};
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a website auditing expert. Always respond with valid JSON only.' },
            { role: 'user', content: aiPrompt }
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback scores
      aiResponse = {
        seo_score: 50,
        performance_score: 50,
        accessibility_score: 50,
        conversion_score: 50,
        mobile_score: 50,
        ux_score: 50,
        findings: {
          positive: ['Website is accessible'],
          issues: ['Unable to perform detailed AI analysis'],
          recommendations: ['Try again for detailed recommendations']
        }
      };
    }

    // Calculate overall score
    const overallScore = Math.round(
      (aiResponse.seo_score + 
       aiResponse.performance_score + 
       aiResponse.accessibility_score + 
       aiResponse.conversion_score + 
       aiResponse.mobile_score + 
       aiResponse.ux_score) / 6
    );

    // Store audit in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: audit, error: dbError } = await supabase
      .from('audits')
      .insert({
        user_id: userId,
        url: normalizedUrl,
        status: 'completed',
        overall_score: overallScore,
        seo_score: aiResponse.seo_score,
        performance_score: aiResponse.performance_score,
        accessibility_score: aiResponse.accessibility_score,
        conversion_score: aiResponse.conversion_score,
        mobile_score: aiResponse.mobile_score,
        ux_score: aiResponse.ux_score,
        audit_data: {
          ...auditData,
          findings: aiResponse.findings
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Audit completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        audit: {
          ...audit,
          findings: aiResponse.findings
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in audit-website function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to audit website'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});