import { Button } from "@/shared/components/ui/button";
import { AuthCard } from "@/features/auth";
import { ArrowLeft, KeyRound, ShieldAlert, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <AuthCard 
      title="Reset Password" 
      description="Credential recovery system"
      sideContent={
        <div className="flex flex-col gap-6">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <LifeBuoy className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight text-destructive">Account Recovery</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We take security seriously. Follow the verification steps to regain access to your business portal.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-destructive/80 uppercase tracking-widest">
            <ShieldAlert className="h-4 w-4" />
            Verification Required
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col gap-5">
          <div className="h-px w-full bg-border/50" />
          <Link 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group py-1" 
            href="/auth/signin"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform opacity-60" />
            Back to <span className="text-primary font-bold underline-offset-4 hover:underline">Sign in</span>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Button 
          className="w-full h-12 text-base font-bold shadow-xl shadow-destructive/15 hover:shadow-destructive/25 active:scale-[0.98] transition-all rounded-2xl group/btn bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
          asChild 
          size="lg"
        >
          <a href="/api/auth/login?mode=forgot">
            <KeyRound className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Request Recovery
          </a>
        </Button>
        
        <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-[0.2em] font-bold">
          Encrypted Security Session
        </p>
      </div>
    </AuthCard>
  );
}
