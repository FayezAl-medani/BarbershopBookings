import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';
import { JwtServiceUtils, AccessTokenPayload, RefreshTokenPayload } from '../common/jwt/jwt.service.js';
import { UserRepository } from '../user/user.repository.js';
import { UserIncludePreset } from '../user/enums/user-include-preset.enum.js';
import { TOKEN_SERVICE } from '../token/token.service.interface.js';
import type { ITokenService } from '../token/token.service.interface.js';
import { ACTIVE_OTP_SERVICE } from '../active-otp/active-otp.service.interface.js';
import type { IActiveOtpService } from '../active-otp/active-otp.service.interface.js';
import { USER_CREDENTIAL_SERVICE } from '../user-credential/user-credential.service.interface.js';
import type { IUserCredentialService } from '../user-credential/user-credential.service.interface.js';
import { USER_ROLE_SERVICE } from '../user-role/user-role.service.interface.js';
import type { IUserRoleService } from '../user-role/user-role.service.interface.js';
import { CUSTOMER_SERVICE } from '../customer/customer.service.interface.js';
import type { ICustomerService } from '../customer/customer.service.interface.js';
import { AdminRepository } from '../admin/admin.repository.js';
import { BarberRepository } from '../barber/barber.repository.js';
import { RoleName } from '../common/enums/role-name.enum.js';
import { AuthResponseDto } from './dto/response/auth-response.dto.js';
import { OtpSentResponseDto } from './dto/response/otp-sent-response.dto.js';
import { IdentifierType } from '../active-otp/enums/identifier-type.enum.js';
import { PrismaTransactionContext } from '../common/prisma/prisma-transaction-context.service.js';
import { ROLE_SERVICE } from '../role/role.service.interface.js';
import type { IRoleService } from '../role/role.service.interface.js';

const OTP_EXPIRY_MINUTES = 3;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtServiceUtils: JwtServiceUtils,
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
    private readonly barberRepository: BarberRepository,
    private readonly i18nService: I18nService,
    private readonly txContext: PrismaTransactionContext,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(ACTIVE_OTP_SERVICE) private readonly activeOtpService: IActiveOtpService,
    @Inject(USER_CREDENTIAL_SERVICE) private readonly userCredentialService: IUserCredentialService,
    @Inject(USER_ROLE_SERVICE) private readonly userRoleService: IUserRoleService,
    @Inject(CUSTOMER_SERVICE) private readonly customerService: ICustomerService,
    @Inject(ROLE_SERVICE) private readonly roleService: IRoleService,
  ) {}

  async adminLogin(email: string, password: string): Promise<AuthResponseDto> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedException(
        this.i18nService.translate('errors.AUTH.INVALID_CREDENTIALS'),
      );
    }

    const credential = await this.userCredentialService.getByUserIdAndMethod(admin.userId, 'PASSWORD');
    if (!credential || !credential.secretHash) {
      throw new UnauthorizedException(
        this.i18nService.translate('errors.AUTH.INVALID_CREDENTIALS'),
      );
    }

    const isValidPassword = await bcrypt.compare(password, credential.secretHash);
    if (!isValidPassword) {
      throw new UnauthorizedException(
        this.i18nService.translate('errors.AUTH.INVALID_CREDENTIALS'),
      );
    }

    // Update last login
    await this.userRepository.updateById(admin.userId, { lastLoginAt: new Date() } as any);

    const userRoles = await this.userRoleService.findAllByUserId(admin.userId);
    const roles = userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

    const accessPayload: AccessTokenPayload = {
      userId: admin.userId,
      adminId: admin.id,
      loggedInAs: RoleName.ADMIN,
      roles,
    };

    const refreshPayload: RefreshTokenPayload = {
      userId: admin.userId,
      loggedInAs: RoleName.ADMIN,
    };

    const tokens = await this.jwtServiceUtils.generateTokenPair(accessPayload, refreshPayload);

    await this.tokenService.create({
      userId: admin.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async sendOtp(phoneNumber: string): Promise<OtpSentResponseDto> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Check for existing OTP
    const existing = await this.activeOtpService.getByIdentifier(phoneNumber);
    if (existing) {
      await this.activeOtpService.deleteById(existing.id);
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.activeOtpService.create({
      identifier: phoneNumber,
      identifierType: IdentifierType.PHONE_NUMBER,
      hashedOtp,
      attempts: 0,
      resendAttempts: 0,
      expiresAt,
    });

    // In production, send OTP via SMS. For development, log it.
    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);

    return {
      message: this.i18nService.translate('messages.AUTH.OTP_SENT'),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  }

  async verifyOtpAndLogin(phoneNumber: string, otp: string): Promise<AuthResponseDto> {
    const activeOtp = await this.activeOtpService.getByIdentifier(phoneNumber);
    if (!activeOtp) {
      throw new BadRequestException(
        this.i18nService.translate('errors.AUTH.INVALID_OTP'),
      );
    }

    if (new Date() > activeOtp.expiresAt) {
      await this.activeOtpService.deleteById(activeOtp.id);
      throw new BadRequestException(
        this.i18nService.translate('errors.AUTH.OTP_EXPIRED'),
      );
    }

    if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
      await this.activeOtpService.deleteById(activeOtp.id);
      throw new BadRequestException(
        this.i18nService.translate('errors.AUTH.MAX_OTP_ATTEMPTS'),
      );
    }

    const isValid = await bcrypt.compare(otp, activeOtp.hashedOtp);
    if (!isValid) {
      await this.activeOtpService.updateById(activeOtp.id, {
        attempts: activeOtp.attempts + 1,
      } as any);
      throw new BadRequestException(
        this.i18nService.translate('errors.AUTH.INVALID_OTP'),
      );
    }

    // OTP is valid - delete it
    await this.activeOtpService.deleteById(activeOtp.id);

    // Find or create user and customer profile
    let user = await this.userRepository.findByPhoneNumber(phoneNumber);
    let customerId: string | undefined;

    if (!user) {
      // Auto-register as customer
      const result = await this.txContext.runInTransaction(async () => {
        const newUser = await this.userRepository.create({
          phoneNumber,
          status: 'ACTIVE' as any,
        });

        const customerRole = await this.roleService.getByName(RoleName.CUSTOMER);
        await this.userRoleService.create({
          userId: newUser.id,
          roleId: customerRole.id,
        });

        const customer = await this.customerService.create({
          userId: newUser.id,
        });

        return { user: newUser, customerId: customer.id };
      });

      user = result.user;
      customerId = result.customerId;
    } else {
      // Update last login
      await this.userRepository.updateById(user.id, { lastLoginAt: new Date() } as any);
      const existingCustomer = await this.barberRepository.findByUserId(user.id).catch(() => null);
      // Try to find customer profile
      try {
        const customer = await this.customerService.getByUserId(user.id);
        customerId = customer.id;
      } catch {
        // No customer profile
      }
    }

    const userRoles = await this.userRoleService.findAllByUserId(user.id);
    const roles = userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      customerId,
      loggedInAs: RoleName.CUSTOMER,
      roles,
    };

    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      loggedInAs: RoleName.CUSTOMER,
    };

    const tokens = await this.jwtServiceUtils.generateTokenPair(accessPayload, refreshPayload);

    // Delete old tokens and create new
    await this.tokenService.deleteAllByUserId(user.id);
    await this.tokenService.create({
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const decoded = this.jwtServiceUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedException(
        this.i18nService.translate('errors.AUTH.INVALID_REFRESH_TOKEN'),
      );
    }

    const user = await this.userRepository.findById(decoded.userId, UserIncludePreset.FULL);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        this.i18nService.translate('errors.USER.NOT_FOUND'),
      );
    }

    const userRoles = await this.userRoleService.findAllByUserId(user.id);
    const roles = userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      loggedInAs: decoded.loggedInAs,
      roles,
    };

    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      loggedInAs: decoded.loggedInAs,
    };

    const tokens = await this.jwtServiceUtils.generateTokenPair(accessPayload, refreshPayload);

    // Update stored tokens
    await this.tokenService.updateByRefreshToken(refreshToken, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async logout(accessToken: string): Promise<void> {
    await this.tokenService.deleteByAccessToken(accessToken);
  }
}
