import { UserCredentialEntity } from './entities/user-credential.entity.js';
import { UserCredentialCreateDto } from './dto/request/user-credential-create.dto.js';

export const USER_CREDENTIAL_SERVICE = 'IUserCredentialService';

export interface IUserCredentialService {
  create(payload: UserCredentialCreateDto): Promise<UserCredentialEntity>;
  getByUserId(userId: string): Promise<UserCredentialEntity | null>;
  getByUserIdAndMethod(userId: string, method: string): Promise<UserCredentialEntity | null>;
  updateById(id: string, data: Partial<UserCredentialCreateDto>): Promise<UserCredentialEntity>;
}
