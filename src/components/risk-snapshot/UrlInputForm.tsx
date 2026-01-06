import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter your landing page URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 text-base bg-card border-border"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading || !url.trim()}
          className="h-12 px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Generate Snapshot
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Free diagnostic • No signup required • Results in seconds
      </p>
    </form>
  );
}
