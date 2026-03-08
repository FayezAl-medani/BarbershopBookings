import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../user/user.repository.js';
import { JwtPayloadWithAuth } from '../../common/entities/jwt-decoded.entity.js';
import { UserRoleRepository } from '../../user-role/user-role.repository.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: any): Promise<JwtPayloadWithAuth> {
    const user = await this.userRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or disabled');
    }

    const userRoles = await this.userRoleRepository.findAllByUserId(user.id);
    const roles = userRoles.map((ur: any) => ur.role?.name).filter(Boolean);

    return {
      userId: payload.userId,
      adminId: payload.adminId,
      barberId: payload.barberId,
      customerId: payload.customerId,
      loggedInAs: payload.loggedInAs,
      roles,
      permissions: [],
    };
  }
}
