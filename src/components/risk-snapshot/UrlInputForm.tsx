import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";

interface UrlInputFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function UrlInputForm({ onSubmit, isLoading }: UrlInputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Unified pill-shaped input container */}
      <div className="flex items-center bg-card rounded-full shadow-lg border border-border p-1.5 md:p-2 transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/20">
        <Input
          type="text"
          placeholder="Enter your landing page URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 h-12 md:h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 md:px-6 placeholder:text-muted-foreground/60"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !url.trim()}
          className="h-12 md:h-14 px-6 md:px-8 rounded-full bg-gradient-primary hover:opacity-90 text-white font-semibold text-sm md:text-base transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">START MY ANALYSIS</span>
              <span className="sm:hidden">ANALYZE</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Helper text */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Free diagnostic • No signup required • Results in seconds</span>
      </div>
    </form>
  );
}
