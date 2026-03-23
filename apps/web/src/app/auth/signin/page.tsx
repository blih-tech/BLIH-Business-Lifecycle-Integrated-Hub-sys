import { Button } from '@/shared/components/ui/button';
import { AuthCard } from '@/features/auth';
import { ChevronRight, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Access your secure organization portal"
      sideContent={
        <div className="flex flex-col gap-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight">
              Enterprise Gateway
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Seamlessly connect to your business ecosystem with our secure
              identity management system.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-primary uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            SSO Protected
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col gap-5">
          <div className="h-px w-full bg-border/50" />
          <p className="text-xs text-muted-foreground text-center">
            Access is managed by your organization&apos;s identity provider.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Button
          className="w-full h-12 text-base font-bold shadow-xl shadow-primary/15 hover:shadow-primary/25 active:scale-[0.98] transition-all rounded-2xl group/btn"
          asChild
          size="lg"
        >
          <a href="/api/auth/login?prompt=login">
            <span className="flex items-center justify-center gap-3">
              <Mail className="h-5 w-5" />
              Continue with BLIH
              <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </a>
        </Button>

        <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-[0.2em] font-bold">
          Bank-grade encryption active
        </p>
      </div>
    </AuthCard>
  );
}
