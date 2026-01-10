export function SnapshotHero() {
  return (
    <header className="relative text-center py-16 md:py-24 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle gradient orb - top right */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-start) / 0.4) 0%, transparent 70%)'
          }}
        />
        {/* Subtle gradient orb - bottom left */}
        <div 
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gradient-end) / 0.4) 0%, transparent 70%)'
          }}
        />
        {/* Decorative curved line */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-24 text-muted/30" 
          viewBox="0 0 1200 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,50 C300,100 600,0 900,50 C1050,75 1150,25 1200,50 L1200,100 L0,100 Z" 
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Hero content */}
      <div className="relative">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
          Uncover Hidden{" "}
          <span className="text-gradient-primary">Performance Risks</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get a signals-based diagnostic of your landing page's performance, SEO, 
          accessibility, and conversion readiness.
        </p>
      </div>
    </header>
  );
}
