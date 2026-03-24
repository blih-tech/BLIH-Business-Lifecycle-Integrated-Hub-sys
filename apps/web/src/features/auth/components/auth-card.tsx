import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  sideContent?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  sideContent,
  className,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-3xl relative group">
      {/* Balanced glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 to-transparent rounded-[1.75rem] blur-xl opacity-50 group-hover:opacity-65 transition duration-1000" />

      <Card
        className={cn(
          'relative w-full border border-white/20 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-[1.5rem] overflow-hidden transition-all duration-300 flex flex-col md:flex-row p-0',
          className,
        )}
      >
        {/* Left Side: Balanced Branding */}
        <div className="md:w-[42%] bg-primary/5 dark:bg-primary/10 border-b md:border-b-0 md:border-r border-white/10 dark:border-white/5 p-8 lg:p-10 flex flex-col justify-center gap-6">
          {sideContent}
        </div>

        {/* Right Side: Main Form Area */}
        <div className="flex-1 flex flex-col justify-center">
          <CardHeader className="flex flex-col gap-2 pt-10 pb-6 px-8 lg:px-12">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground/80 font-medium">
                {description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-8 px-8 lg:px-12 pb-10">
            <div className="flex flex-col gap-6">{children}</div>

            {footer && <div className="pt-2">{footer}</div>}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
