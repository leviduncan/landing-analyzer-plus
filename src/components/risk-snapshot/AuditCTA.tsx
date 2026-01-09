import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

export function AuditCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 md:p-12 mt-12">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Need a Deeper Dive?
        </h3>
        <p className="text-white/80 mb-6 max-w-lg mx-auto text-base md:text-lg">
          This snapshot is just the beginning. Get a comprehensive Performance & Core Web Vitals audit 
          with actionable recommendations tailored to your stack.
        </p>
        <Button 
          size="lg"
          className="rounded-full px-8 py-6 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg group"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Request a Performance Audit Call
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
}
