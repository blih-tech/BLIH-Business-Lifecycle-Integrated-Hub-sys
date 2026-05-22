'use client';

import * as React from 'react';

import type { WebSession } from './session';

const SessionContext = React.createContext<WebSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: WebSession;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): WebSession {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within <SessionProvider>');
  }
  return ctx;
}

export function useOptionalSession(): WebSession | null {
  return React.useContext(SessionContext);
}
