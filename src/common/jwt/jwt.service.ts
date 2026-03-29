import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  JwtDecodedEntity,
  JwtRefreshPayloadWithAuth,
} from "../entities/index.js";
import { RoleName } from "../enums/index.js";

export interface AccessTokenPayload {
  userId: string;
  adminId?: string;
  barberId?: string;
  customerId?: string;
  barbershopId?: string;
  loggedInAs: RoleName;
  roles: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  loggedInAs: RoleName;
}

@Injectable()
export class JwtServiceUtils {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.get("JWT_ACCESS_EXPIRE"),
    });
    return accessToken;
  }

  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRE"),
    });
    return refreshToken;
  }

  verifyAccessToken(token: string): JwtDecodedEntity | null {
    if (!token) return null;
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      });
      if (!decoded) return null;
      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtRefreshPayloadWithAuth | null {
    if (!token) return null;
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
      if (!decoded) return null;
      return {
        userId: decoded.userId,
        loggedInAs: decoded.loggedInAs,
      };
    } catch {
      return null;
    }
  }

  async generateTokenPair(
    accessPayload: AccessTokenPayload,
    refreshPayload: RefreshTokenPayload,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(accessPayload),
      this.generateRefreshToken(refreshPayload),
    ]);
    return { accessToken, refreshToken };
  }
}
