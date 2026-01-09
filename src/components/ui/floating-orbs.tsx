export const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, hsl(var(--gradient-start)) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float opacity-[0.06]"
        style={{ 
          animationDelay: '1s',
          background: 'radial-gradient(circle, hsl(var(--gradient-end)) 0%, transparent 70%)'
        }} 
      />
      <div 
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl animate-float opacity-[0.04]"
        style={{ 
          animationDelay: '2s',
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)'
        }} 
      />
    </div>
  );
};
