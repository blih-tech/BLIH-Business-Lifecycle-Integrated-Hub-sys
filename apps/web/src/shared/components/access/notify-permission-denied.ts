import { toast } from 'sonner';

const DEFAULT_MESSAGE =
  'You do not have permission to perform this action. Contact an administrator if you need access.';

export function notifyPermissionDenied(message?: string): void {
  toast.error(message ?? DEFAULT_MESSAGE);
}
