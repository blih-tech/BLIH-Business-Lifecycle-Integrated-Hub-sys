export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#fafafa] dark:bg-[#050505]">
      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: '64px 64px' 
        }} 
      />
      
      {/* Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[70%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] animate-pulse transition-colors duration-1000" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] animate-pulse transition-colors duration-1000 delay-700" />
      
      {/* Ambient center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-gradient-radial from-primary/5 to-transparent dark:from-primary/[0.02] opacity-50" />
    </div>
  );
}
