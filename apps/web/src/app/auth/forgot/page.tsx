import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We will redirect you to BLIH Identity to send a reset link.
            </p>
            <Button className="w-full" asChild>
              <a href="/api/auth/login?mode=forgot">Continue to reset</a>
            </Button>
            <a className="text-sm text-primary underline-offset-4 hover:underline" href="/auth/signin">
              Back to sign in
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
