import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign in to BLIH</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use your organization account to continue.
            </p>
            <Button className="w-full" asChild>
              <a href="/api/auth/login?prompt=login">Continue with BLIH</a>
            </Button>
            <div className="flex items-center justify-between text-sm">
              <a className="text-primary underline-offset-4 hover:underline" href="/auth/signup">
                Create account
              </a>
              <a className="text-primary underline-offset-4 hover:underline" href="/auth/forgot">
                Forgot password
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
