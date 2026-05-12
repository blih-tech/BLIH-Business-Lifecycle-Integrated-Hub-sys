import type { JSX, ReactNode } from 'react';

type AccessDeniedCalloutProps = {
  title?: string;
  description?: string;
  requiredPermission?: string;
  children?: ReactNode;
};

export function AccessDeniedCallout({
  title = 'Access restricted',
  description = 'Your account does not have the required permission to view this content. Contact an administrator if you need access.',
  requiredPermission,
  children,
}: AccessDeniedCalloutProps): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-8 md:px-5">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {requiredPermission && process.env.NODE_ENV !== 'production' ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Required: {requiredPermission}
          </p>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}
