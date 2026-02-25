import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl space-y-6 p-6 md:p-10">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">BLIH CORE Theme Preview</h1>
            <Badge>HR Portal</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This page demonstrates your Figma-aligned shadcn theme tokens (background, card,
            primary, muted, borders, and typography).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button>Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Background / Foreground</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              App canvas uses <code>bg-background</code> and base text uses{" "}
              <code>text-foreground</code>.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Primary / Ring</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Brand blue is mapped to <code>--primary</code> and focus rings to{" "}
              <code>--ring</code>.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Muted / Border</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Neutral grays from Figma are mapped to <code>--muted</code> and{" "}
              <code>--border</code>.
            </CardContent>
          </Card>
        </section>

        <section className="rounded-xl border border-border bg-sidebar p-6 text-sidebar-foreground">
          <p className="text-sm font-medium">Sidebar Token Sample</p>
          <p className="mt-1 text-sm opacity-90">
            This block uses <code>bg-sidebar</code> and <code>text-sidebar-foreground</code>.
          </p>
        </section>
      </main>
    </div>
  );
}
