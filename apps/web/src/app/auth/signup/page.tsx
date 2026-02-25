import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your BLIH account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be redirected to BLIH Identity to complete registration.
            </p>
            <Button className="w-full" asChild>
              <a href="/api/auth/login?mode=signup">Continue to registration</a>
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
