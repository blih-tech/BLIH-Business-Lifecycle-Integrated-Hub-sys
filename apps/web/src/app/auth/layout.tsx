import { AuthBackground } from '@/features/auth/components/auth-background';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Enhanced background layer */}
      <AuthBackground />

      {/* Animated container for content */}
      <div className="w-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        {children}
      </div>

      <footer className="mt-12 text-center flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500 ease-out">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
          BLIH Core Ecosystem
        </p>
        <p className="text-[10px] text-muted-foreground/60 font-medium">
          &copy; {new Date().getFullYear()} Business Lifecycle Integrated Hub.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}
