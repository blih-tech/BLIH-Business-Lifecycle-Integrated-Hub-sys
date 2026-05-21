import { Skeleton } from '@/shared/components/ui/skeleton';

export default function HrLoading() {
  return (
    <div className="flex min-h-screen w-full bg-background animate-in fade-in duration-500">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex w-[280px] flex-col border-r border-border bg-muted/30">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 px-4 space-y-6 pt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-sidebar Skeleton (if applicable) */}
      <div className="hidden lg:flex w-[304px] flex-col border-r border-border bg-[#f9fafb]">
        <div className="h-[56px] border-b border-border flex flex-col justify-center px-8">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-9 w-full" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-[56px] border-b border-border flex items-center justify-between px-6">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
