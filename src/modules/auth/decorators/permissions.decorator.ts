import { SetMetadata } from '@nestjs/common';
import { Permission } from '../permission.service';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
