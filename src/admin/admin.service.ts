import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import * as bcrypt from "bcryptjs";
import { IAdminService } from "./admin.service.interface.js";
import { AdminRepository } from "./admin.repository.js";
import { AdminMapper } from "./mappers/admin.mapper.js";
import { AdminEntity } from "./entities/admin.entity.js";
import { AdminCreateDto } from "./dto/request/admin-create.dto.js";
import { AdminRegisterDto } from "./dto/request/admin-register.dto.js";
import { AdminFilterDto } from "./dto/request/admin-filter.dto.js";
import { PaginationParams } from "../common/dto/pagination-params.dto.js";
import { SortingParam } from "../common/decorators/sorting-params.decorator.js";
import { IPaginatedResult } from "../common/dto/paging-data-response.dto.js";
import {
  MessageResponseDto,
  SuccessResponseDto,
} from "../common/dto/status.dto.js";
import { PrismaTransactionContext } from "../common/prisma/prisma-transaction-context.service.js";
import { UserRepository } from "../user/user.repository.js";
import { UserStatus } from "../user/enums/user-status.enum.js";
import { USER_CREDENTIAL_SERVICE } from "../user-credential/user-credential.service.interface.js";
import type { IUserCredentialService } from "../user-credential/user-credential.service.interface.js";
import { ROLE_SERVICE } from "../role/role.service.interface.js";
import type { IRoleService } from "../role/role.service.interface.js";
import { USER_ROLE_SERVICE } from "../user-role/user-role.service.interface.js";
import type { IUserRoleService } from "../user-role/user-role.service.interface.js";
import { RoleName } from "../common/enums/role-name.enum.js";

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly adminMapper: AdminMapper,
    private readonly userRepository: UserRepository,
    private readonly i18nService: I18nService,
    private readonly txContext: PrismaTransactionContext,
    @Inject(USER_CREDENTIAL_SERVICE)
    private readonly userCredentialService: IUserCredentialService,
    @Inject(ROLE_SERVICE)
    private readonly roleService: IRoleService,
    @Inject(USER_ROLE_SERVICE)
    private readonly userRoleService: IUserRoleService,
  ) {}

  async registerAdminUser(payload: AdminRegisterDto): Promise<AdminEntity> {
    const existsByEmail = await this.adminRepository.existsByEmail(
      payload.email,
    );
    if (existsByEmail) {
      throw new ConflictException(
        this.i18nService.translate("errors.ADMIN.ALREADY_EXISTS"),
      );
    }

    const existsByPhone = await this.userRepository.existsByPhoneNumber(
      payload.phoneNumber,
    );
    if (existsByPhone) {
      throw new ConflictException(
        this.i18nService.translate(
          "errors.USER.ALREADY_EXISTS_WITH_PHONE_NUMBER",
        ),
      );
    }

    const result = await this.txContext.runInTransaction(async () => {
      const user = await this.userRepository.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        status: UserStatus.ACTIVE,
      });

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      await this.userCredentialService.create({
        userId: user.id,
        method: "PASSWORD",
        identifier: payload.email,
        secretHash: hashedPassword,
      });

      const role = await this.roleService.getByName(RoleName.ADMIN);
      await this.userRoleService.create({
        userId: user.id,
        roleId: role.id,
      });

      const admin = await this.adminRepository.create({
        userId: user.id,
        email: payload.email,
      });

      return admin;
    });

    return this.adminMapper.modelToEntity(result);
  }

  async findAllPaging(
    filter: AdminFilterDto,
    pagingArgs?: PaginationParams,
    sort?: SortingParam | null,
  ): Promise<IPaginatedResult<AdminEntity>> {
    const result = await this.adminRepository.findAllPaging(
      filter,
      pagingArgs,
      sort,
    );
    return {
      data: result.data.map((model) => this.adminMapper.modelToEntity(model)),
      meta: result.meta,
    };
  }

  async create(payload: AdminCreateDto): Promise<AdminEntity> {
    const admin = await this.adminRepository.create(payload);
    return this.adminMapper.modelToEntity(admin);
  }

  async getById(id: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundException(
        this.i18nService.translate("errors.ADMIN.NOT_FOUND"),
      );
    }
    return this.adminMapper.modelToEntity(admin);
  }

  async getByUserId(userId: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findByUserId(userId);
    if (!admin) {
      throw new NotFoundException(
        this.i18nService.translate("errors.ADMIN.NOT_FOUND"),
      );
    }
    return this.adminMapper.modelToEntity(admin);
  }

  async getByEmail(email: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new NotFoundException(
        this.i18nService.translate("errors.ADMIN.NOT_FOUND"),
      );
    }
    return this.adminMapper.modelToEntity(admin);
  }

  async remove(id: string): Promise<MessageResponseDto> {
    await this.getById(id);
    await this.adminRepository.deleteById(id);
    return new SuccessResponseDto("Admin deleted successfully");
  }
}
