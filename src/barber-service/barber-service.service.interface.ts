import { BarberServiceEntity } from './entities/barber-service.entity.js';
import { MessageResponseDto } from '../common/dto/status.dto.js';

export const BARBER_SERVICE_SERVICE = 'IBarberServiceService';

export interface IBarberServiceService {
  addServiceToBarber(barberId: string, serviceId: string): Promise<BarberServiceEntity>;
  getBarberServices(barberId: string): Promise<BarberServiceEntity[]>;
  removeServiceFromBarber(barberId: string, serviceId: string): Promise<MessageResponseDto>;
  barberOffersService(barberId: string, serviceId: string): Promise<boolean>;
}
