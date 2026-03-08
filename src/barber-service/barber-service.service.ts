import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IBarberServiceService } from './barber-service.service.interface.js';
import { BarberServiceRepository } from './barber-service.repository.js';
import { BarberServiceEntity } from './entities/barber-service.entity.js';
import { MessageResponseDto, SuccessResponseDto } from '../common/dto/status.dto.js';

@Injectable()
export class BarberServiceService implements IBarberServiceService {
  constructor(
    private readonly barberServiceRepository: BarberServiceRepository,
    private readonly i18nService: I18nService,
  ) {}

  async addServiceToBarber(barberId: string, serviceId: string): Promise<BarberServiceEntity> {
    const exists = await this.barberServiceRepository.exists(barberId, serviceId);
    if (exists) {
      throw new ConflictException('Barber already offers this service');
    }
    const result = await this.barberServiceRepository.create(barberId, serviceId);
    return new BarberServiceEntity({
      barberId: result.barberId,
      serviceId: result.serviceId,
      createdAt: result.createdAt,
    });
  }

  async getBarberServices(barberId: string): Promise<BarberServiceEntity[]> {
    const results = await this.barberServiceRepository.findAllByBarberId(barberId);
    return results.map(
      (r) =>
        new BarberServiceEntity({
          barberId: r.barberId,
          serviceId: r.serviceId,
          createdAt: r.createdAt,
        }),
    );
  }

  async removeServiceFromBarber(barberId: string, serviceId: string): Promise<MessageResponseDto> {
    const exists = await this.barberServiceRepository.exists(barberId, serviceId);
    if (!exists) {
      throw new NotFoundException('Barber does not offer this service');
    }
    await this.barberServiceRepository.delete(barberId, serviceId);
    return new SuccessResponseDto('Service removed from barber');
  }

  async barberOffersService(barberId: string, serviceId: string): Promise<boolean> {
    return this.barberServiceRepository.exists(barberId, serviceId);
  }
}
