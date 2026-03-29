import { Injectable } from "@nestjs/common";
import { IActiveOtpService } from "./active-otp.service.interface.js";
import { ActiveOtpRepository } from "./active-otp.repository.js";
import { ActiveOtpMapper } from "./mappers/active-otp.mapper.js";
import { ActiveOtpEntity } from "./entities/active-otp.entity.js";
import { ActiveOtpCreateDto } from "./dto/request/active-otp-create.dto.js";

@Injectable()
export class ActiveOtpService implements IActiveOtpService {
  constructor(
    private readonly activeOtpRepository: ActiveOtpRepository,
    private readonly activeOtpMapper: ActiveOtpMapper,
  ) {}

  async create(payload: ActiveOtpCreateDto): Promise<ActiveOtpEntity> {
    const otp = await this.activeOtpRepository.create(payload);
    return this.activeOtpMapper.modelToEntity(otp);
  }

  async getByIdentifier(identifier: string): Promise<ActiveOtpEntity | null> {
    const otp = await this.activeOtpRepository.findByIdentifier(identifier);
    return otp ? this.activeOtpMapper.modelToEntity(otp) : null;
  }

  async updateById(
    id: string,
    data: Partial<ActiveOtpCreateDto>,
  ): Promise<ActiveOtpEntity> {
    const otp = await this.activeOtpRepository.updateById(id, data);
    return this.activeOtpMapper.modelToEntity(otp);
  }

  async deleteById(id: string): Promise<void> {
    await this.activeOtpRepository.deleteById(id);
  }

  async deleteExpiredOtps(): Promise<number> {
    return this.activeOtpRepository.deleteExpiredOtps();
  }
}
