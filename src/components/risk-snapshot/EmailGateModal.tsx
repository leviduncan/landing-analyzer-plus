import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, FileText, Sparkles } from "lucide-react";

interface EmailGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

export function EmailGateModal({ open, onOpenChange, onSubmit, isLoading }: EmailGateModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    await onSubmit(email.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
        
        <DialogHeader className="pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-primary-subtle">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Get Your Full Report</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Enter your email to unlock the complete analysis, detailed recommendations, and downloadable PDF.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className={`h-12 text-base ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-full bg-gradient-primary hover:opacity-90 text-base font-semibold" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking Report...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Unlock Full Report
              </>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>No spam. Your email is only used to send your report.</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
