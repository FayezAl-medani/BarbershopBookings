import { ActiveOtpEntity } from './entities/active-otp.entity.js';
import { ActiveOtpCreateDto } from './dto/request/active-otp-create.dto.js';

export const ACTIVE_OTP_SERVICE = 'IActiveOtpService';

export interface IActiveOtpService {
  create(payload: ActiveOtpCreateDto): Promise<ActiveOtpEntity>;
  getByIdentifier(identifier: string): Promise<ActiveOtpEntity | null>;
  updateById(id: string, data: Partial<ActiveOtpCreateDto>): Promise<ActiveOtpEntity>;
  deleteById(id: string): Promise<void>;
  deleteExpiredOtps(): Promise<number>;
}
