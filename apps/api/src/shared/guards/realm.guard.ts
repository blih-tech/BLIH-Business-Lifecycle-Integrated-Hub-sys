import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RealmGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { realm?: string };
    }>();

    const userRealm = request.user?.realm ?? null;

    if (!userRealm) {
      throw new ForbiddenException('Missing user realm');
    }

    return true;
  }
}
