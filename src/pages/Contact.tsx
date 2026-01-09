import { Mail, Linkedin, ExternalLink, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const WEBHOOK_URL = "https://n8n.growclientsai.com/webhook/email-submission";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    siteUrl: "",
    biggestIssue: "",
    timeline: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          siteUrl: formData.siteUrl,
          biggestIssue: formData.biggestIssue,
          timeline: formData.timeline,
          message: formData.message,
          timestamp: new Date().toISOString(),
          source: 'consultant_website',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Request Sent",
        description: "Thank you for reaching out. I'll get back to you within 1-2 business days.",
      });
      
      setFormData({ name: "", email: "", siteUrl: "", biggestIssue: "", timeline: "", message: "" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error Sending Request",
        description: "Please try emailing me directly at darrin@darrinduncan.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section className="py-24 pt-32 bg-background min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-start)) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.05]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-end)) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Book a <span className="text-gradient-primary">Performance Audit</span> Call
            </h1>
            <div className="w-20 h-1 bg-gradient-primary mx-auto mb-6 rounded-full" />
            <p className="text-lg text-muted-foreground">
              Let's discuss your frontend challenges and how I can help.
            </p>
          </div>

          {/* Direct Contact */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a
              href="mailto:darrin@darrinduncan.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-full bg-muted/50 hover:bg-muted"
            >
              <Mail className="w-5 h-5" />
              <span>darrin@darrinduncan.com</span>
            </a>
            <a
              href="https://linkedin.com/in/darrinduncan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-full bg-muted/50 hover:bg-muted"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Contact Form */}
          <Card className="p-8 border shadow-lg hover-lift gradient-border overflow-hidden animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              {/* Site URL */}
              <div className="space-y-2">
                <Label htmlFor="siteUrl" className="text-foreground text-sm font-medium">Site URL</Label>
                <Input
                  id="siteUrl"
                  name="siteUrl"
                  value={formData.siteUrl}
                  onChange={handleChange}
                  required
                  className="h-12 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="https://yoursite.com"
                />
              </div>

              {/* Biggest Issue */}
              <div className="space-y-2">
                <Label htmlFor="biggestIssue" className="text-foreground text-sm font-medium">Biggest Issue</Label>
                <Input
                  id="biggestIssue"
                  name="biggestIssue"
                  value={formData.biggestIssue}
                  onChange={handleChange}
                  required
                  className="h-12 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Slow checkout, Core Web Vitals failures, frequent regressions"
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-foreground text-sm font-medium">
                  Timeline/Urgency <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="h-12 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Before Q4 peak, ASAP, Exploring options"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground text-sm font-medium">
                  Additional Context <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Any other details that would help me understand your situation..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-gradient-primary hover:opacity-90 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 w-5 h-5" />
                    Request Audit Call
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
