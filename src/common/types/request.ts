import type { Request } from 'express';
import { UserEntity } from '@/modules/user/user.entity';

export type TRequest = Request & { authUser: UserEntity };
