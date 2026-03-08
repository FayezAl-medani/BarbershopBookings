import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ITokenService } from './token.service.interface.js';
import { TokenRepository } from './token.repository.js';
import { TokenMapper } from './mappers/token.mapper.js';
import { TokenEntity } from './entities/token.entity.js';
import { TokenCreateDto } from './dto/request/token-create.dto.js';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly tokenMapper: TokenMapper,
    private readonly i18nService: I18nService,
  ) {}

  async create(payload: TokenCreateDto): Promise<TokenEntity> {
    const token = await this.tokenRepository.create(payload);
    return this.tokenMapper.modelToEntity(token);
  }

  async getByAccessToken(accessToken: string): Promise<TokenEntity> {
    const token = await this.tokenRepository.findByAccessToken(accessToken);
    if (!token) {
      throw new NotFoundException(
        this.i18nService.translate('errors.TOKEN.NOT_FOUND'),
      );
    }
    return this.tokenMapper.modelToEntity(token);
  }

  async getByRefreshToken(refreshToken: string): Promise<TokenEntity> {
    const token = await this.tokenRepository.findByRefreshToken(refreshToken);
    if (!token) {
      throw new NotFoundException(
        this.i18nService.translate('errors.TOKEN.NOT_FOUND'),
      );
    }
    return this.tokenMapper.modelToEntity(token);
  }

  async updateByRefreshToken(refreshToken: string, data: Partial<TokenCreateDto>): Promise<TokenEntity> {
    const token = await this.tokenRepository.updateByRefreshToken(refreshToken, data);
    return this.tokenMapper.modelToEntity(token);
  }

  async deleteByAccessToken(accessToken: string): Promise<void> {
    await this.tokenRepository.deleteByAccessToken(accessToken);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.tokenRepository.deleteAllByUserId(userId);
  }
}
