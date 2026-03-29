import { Injectable } from "@nestjs/common";
import { IUserCredentialService } from "./user-credential.service.interface.js";
import { UserCredentialRepository } from "./user-credential.repository.js";
import { UserCredentialMapper } from "./mappers/user-credential.mapper.js";
import { UserCredentialEntity } from "./entities/user-credential.entity.js";
import { UserCredentialCreateDto } from "./dto/request/user-credential-create.dto.js";

@Injectable()
export class UserCredentialService implements IUserCredentialService {
  constructor(
    private readonly userCredentialRepository: UserCredentialRepository,
    private readonly userCredentialMapper: UserCredentialMapper,
  ) {}

  async create(
    payload: UserCredentialCreateDto,
  ): Promise<UserCredentialEntity> {
    const credential = await this.userCredentialRepository.create(payload);
    return this.userCredentialMapper.modelToEntity(credential);
  }

  async getByUserId(userId: string): Promise<UserCredentialEntity | null> {
    const credential = await this.userCredentialRepository.findByUserId(userId);
    return credential
      ? this.userCredentialMapper.modelToEntity(credential)
      : null;
  }

  async getByUserIdAndMethod(
    userId: string,
    method: string,
  ): Promise<UserCredentialEntity | null> {
    const credential =
      await this.userCredentialRepository.findByUserIdAndMethod(userId, method);
    return credential
      ? this.userCredentialMapper.modelToEntity(credential)
      : null;
  }

  async updateById(
    id: string,
    data: Partial<UserCredentialCreateDto>,
  ): Promise<UserCredentialEntity> {
    const credential = await this.userCredentialRepository.updateById(id, data);
    return this.userCredentialMapper.modelToEntity(credential);
  }
}
