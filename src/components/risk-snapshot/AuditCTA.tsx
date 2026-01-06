import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function AuditCTA() {
  return (
    <Card className="border shadow-card bg-primary/5 mt-8">
      <CardContent className="py-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Need a Deeper Dive?</h3>
        <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
          This snapshot is just the beginning. Get a comprehensive Performance & Core Web Vitals audit 
          with actionable recommendations tailored to your stack.
        </p>
        <Button size="lg">
          <Calendar className="mr-2 h-4 w-4" />
          Request a Performance Audit Call
        </Button>
      </CardContent>
    </Card>
  );
}
