import { Button } from "@/shared/components/ui/button";
import { AuthCard } from "@/features/auth";
import { ArrowLeft, UserPlus, CheckCircle2, Globe, Rocket } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthCard 
      title="Create Account" 
      description="Start your business journey with BLIH"
      sideContent={
        <div className="flex flex-col gap-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight text-primary">Grow Faster</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Join thousands of businesses optimizing their lifecycle with our integrated hub.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              "Automated Workflows",
              "Unified CRM & HR",
              "Real-time Analytics"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-foreground/75">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {text}
              </div>
            ))}
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
            Already registered? <span className="text-primary font-bold underline-offset-4 hover:underline">Sign in</span>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Button 
          className="w-full h-12 text-base font-bold shadow-xl shadow-primary/15 hover:shadow-primary/25 active:scale-[0.98] transition-all rounded-2xl group/btn" 
          asChild 
          size="lg"
        >
          <a href="/api/auth/login?mode=signup">
            <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            Begin Registration
          </a>
        </Button>

        <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
          <Globe className="h-3 w-3" />
          Global Enterprise Support
        </p>
      </div>
    </AuthCard>
  );
}
