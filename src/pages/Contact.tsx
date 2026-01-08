import { Mail, Linkedin, ExternalLink, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    <section className="py-24 pt-32 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bebas text-foreground mb-4">
              Book a Performance Audit Call
            </h1>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground">
              Let's discuss your frontend challenges and how I can help.
            </p>
          </div>

          {/* Direct Contact */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a
              href="mailto:darrin@darrinduncan.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>darrin@darrinduncan.com</span>
            </a>
            <a
              href="https://linkedin.com/in/darrinduncan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground text-sm">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background border-border focus:border-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-background border-border focus:border-primary"
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>

              {/* Site URL */}
              <div className="space-y-2">
                <Label htmlFor="siteUrl" className="text-foreground text-sm">Site URL</Label>
                <Input
                  id="siteUrl"
                  name="siteUrl"
                  value={formData.siteUrl}
                  onChange={handleChange}
                  required
                  className="bg-background border-border focus:border-primary"
                  placeholder="https://yoursite.com"
                />
              </div>

              {/* Biggest Issue */}
              <div className="space-y-2">
                <Label htmlFor="biggestIssue" className="text-foreground text-sm">Biggest Issue</Label>
                <Input
                  id="biggestIssue"
                  name="biggestIssue"
                  value={formData.biggestIssue}
                  onChange={handleChange}
                  required
                  className="bg-background border-border focus:border-primary"
                  placeholder="e.g., Slow checkout, Core Web Vitals failures, frequent regressions"
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-foreground text-sm">
                  Timeline/Urgency <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="bg-background border-border focus:border-primary"
                  placeholder="e.g., Before Q4 peak, ASAP, Exploring options"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground text-sm">
                  Additional Context <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="bg-background border-border focus:border-primary resize-none"
                  placeholder="Any other details that would help me understand your situation..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 w-4 h-4" />
                    Request Audit Call
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
