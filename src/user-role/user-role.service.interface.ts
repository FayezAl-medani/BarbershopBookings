import { UserRoleEntity } from './entities/user-role.entity.js';
import { UserRoleCreateDto } from './dto/request/user-role-create.dto.js';

export const USER_ROLE_SERVICE = 'IUserRoleService';

export interface IUserRoleService {
  create(payload: UserRoleCreateDto): Promise<UserRoleEntity>;
  findAllByUserId(userId: string): Promise<UserRoleEntity[]>;
  existByUserIdAndRoleId(userId: string, roleId: string): Promise<boolean>;
}
