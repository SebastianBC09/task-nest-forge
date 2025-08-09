import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { isUuidString } from '../../domain/guards/type-guards';

@Injectable()
export class HeaderUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const raw = request.headers['x-user-id'] ?? request.headers['x_user_id'];
    const value = Array.isArray(raw) ? raw[0] : raw;

    if(!value) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    const id = String(value).trim();
    if(!isUuidString(id)) {
      throw new BadRequestException('x-user-id must be a valid UUID');
    }

    request.user = { id };
    return true;

  }
}