import { TokenEntity } from './entities/token.entity.js';
import { TokenCreateDto } from './dto/request/token-create.dto.js';

export const TOKEN_SERVICE = 'ITokenService';

export interface ITokenService {
  create(payload: TokenCreateDto): Promise<TokenEntity>;
  getByAccessToken(accessToken: string): Promise<TokenEntity>;
  getByRefreshToken(refreshToken: string): Promise<TokenEntity>;
  updateByRefreshToken(refreshToken: string, data: Partial<TokenCreateDto>): Promise<TokenEntity>;
  deleteByAccessToken(accessToken: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
