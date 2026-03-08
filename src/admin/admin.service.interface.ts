import { AdminEntity } from './entities/admin.entity.js';
import { AdminCreateDto } from './dto/request/admin-create.dto.js';
import { AdminRegisterDto } from './dto/request/admin-register.dto.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const ADMIN_SERVICE = 'IAdminService';

export interface IAdminService {
  registerAdminUser(payload: AdminRegisterDto): Promise<AdminEntity>;
  create(payload: AdminCreateDto): Promise<AdminEntity>;
  getById(id: string): Promise<AdminEntity>;
  getByUserId(userId: string): Promise<AdminEntity>;
  getByEmail(email: string): Promise<AdminEntity>;
  remove(id: string): Promise<MessageResponseDto>;
}
