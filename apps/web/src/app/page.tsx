import { AuthGate } from '@/shared/auth/AuthGate';
import { HomeRedirect } from './home-redirect';

export default function HomePage() {
  return (
    <AuthGate>
      <HomeRedirect />
    </AuthGate>
  );
}
